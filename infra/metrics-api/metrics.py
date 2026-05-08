import os
import time
import requests
from flask import Flask, jsonify
from flask_cors import CORS
import psutil

app = Flask(__name__)
CORS(app, origins=["https://bytefort.xyz"])

PROMETHEUS_URL = os.getenv("PROMETHEUS_URL", "http://localhost:9091")
ZFS_AGENT_URL  = os.getenv("ZFS_AGENT_URL",  "http://192.168.1.98:5001")

_net_prev      = psutil.net_io_counters()
_net_prev_time = time.monotonic()


def prom_query(q):
    """Run an instant PromQL query. Returns float or None."""
    try:
        r = requests.get(
            f"{PROMETHEUS_URL}/api/v1/query",
            params={"query": q},
            timeout=2,
        )
        if r.ok:
            results = r.json().get("data", {}).get("result", [])
            if results:
                return float(results[0]["value"][1])
    except Exception:
        pass
    return None


def net_mbps():
    """VM NIC stats via psutil — vmware_exporter doesn't expose host NIC bps."""
    global _net_prev, _net_prev_time
    cur = psutil.net_io_counters()
    now = time.monotonic()
    dt  = (now - _net_prev_time) or 1
    up  = (cur.bytes_sent - _net_prev.bytes_sent) / dt / 1e6
    dn  = (cur.bytes_recv - _net_prev.bytes_recv) / dt / 1e6
    _net_prev      = cur
    _net_prev_time = now
    return round(max(up, 0), 2), round(max(dn, 0), 2)


def zfs_stats():
    try:
        r = requests.get(f"{ZFS_AGENT_URL}/zfs", timeout=2)
        if r.ok:
            return r.json()
    except Exception:
        pass
    return None


@app.route("/metrics")
def metrics():
    # ── CPU (ESXi host %) ────────────────────────────────────────────────
    cpu_mhz_used  = prom_query('avg(vmware_host_cpu_usage)')
    cpu_mhz_total = prom_query('avg(vmware_host_cpu_max)')
    if cpu_mhz_used is not None and cpu_mhz_total and cpu_mhz_total > 0:
        cpu = round((cpu_mhz_used / cpu_mhz_total) * 100, 1)
    else:
        cpu = round(psutil.cpu_percent(interval=0.2), 1)

    # ── RAM (ESXi host %) ────────────────────────────────────────────────
    mem_used_mb  = prom_query('avg(vmware_host_memory_usage)')
    mem_total_mb = prom_query('avg(vmware_host_memory_max)')
    if mem_used_mb is not None and mem_total_mb and mem_total_mb > 0:
        mem = round((mem_used_mb / mem_total_mb) * 100, 1)
    else:
        mem = round(psutil.virtual_memory().percent, 1)

    mem_used_gb  = round(mem_used_mb  / 1024, 1) if mem_used_mb  is not None else None
    mem_total_gb = round(mem_total_mb / 1024, 1) if mem_total_mb is not None else None

    # ── CPU Temp (ESXi hardware sensor) ─────────────────────────────────
    temp = prom_query('vmware_host_sensor_temperature')

    # ── Network (VM NIC) ─────────────────────────────────────────────────
    net_up, net_dn = net_mbps()

    # ── Storage (ZFS agent → ESXi datastore → psutil fallback) ──────────
    zfs = zfs_stats()
    if zfs and "error" not in zfs:
        disk_used   = zfs.get("alloc_tb")
        disk_total  = zfs.get("size_tb")
        disk_frag   = zfs.get("frag_pct")
        disk_health = zfs.get("health")
        compress    = zfs.get("compress_ratio")
    else:
        ds_free = prom_query('sum(vmware_datastore_freespace_size)')
        ds_cap  = prom_query('sum(vmware_datastore_capacity_size)')
        if ds_free is not None and ds_cap and ds_cap > 0:
            disk_used  = round((ds_cap - ds_free) / 1e12, 2)
            disk_total = round(ds_cap / 1e12, 2)
        else:
            raw        = psutil.disk_usage("/")
            disk_used  = round(raw.used  / 1e12, 2)
            disk_total = round(raw.total / 1e12, 2)
        disk_frag   = None
        disk_health = None
        compress    = None

    return jsonify({
        "cpu":            cpu,
        "mem":            mem,
        "mem_used_gb":    mem_used_gb,
        "mem_total_gb":   mem_total_gb,
        "net_up":         net_up,
        "net_dn":         net_dn,
        "disk":           disk_used,
        "disk_total":     disk_total,
        "disk_frag":      disk_frag,
        "disk_health":    disk_health,
        "compress_ratio": compress,
        "temp":           round(temp, 1) if temp is not None else None,
        "req":            None,
    })


@app.route("/health")
def health():
    return jsonify({"ok": True})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
