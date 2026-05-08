import os
import subprocess
from flask import Flask, jsonify

app = Flask(__name__)

# Set ZFS_POOL env var if your pool isn't named "datastore"
POOL = os.getenv("ZFS_POOL", "datastore")


def _run(cmd, timeout=5):
    return subprocess.check_output(cmd, text=True, timeout=timeout).strip()


@app.route("/zfs")
def zfs():
    try:
        # zpool list -Hp: no header, parseable (raw bytes for sizes, int for frag)
        line = _run(["zpool", "list", "-Hp", "-o", "name,size,alloc,free,frag,health", POOL])
        name, size, alloc, free, frag, health = line.split("\t")

        def to_tb(b):
            return round(int(b) / 1e12, 2)

        # zfs get compressratio returns e.g. "1.94x"
        ratio_raw = _run(["zfs", "get", "-Hp", "-o", "value", "compressratio", POOL])
        compress = round(float(ratio_raw.rstrip("x")), 2)

        return jsonify({
            "pool":           name,
            "size_tb":        to_tb(size),
            "alloc_tb":       to_tb(alloc),
            "free_tb":        to_tb(free),
            "frag_pct":       int(frag.rstrip("%")),
            "health":         health,
            "compress_ratio": compress,
        })
    except Exception as exc:
        return jsonify({"error": str(exc)}), 503


@app.route("/health")
def health():
    return jsonify({"ok": True})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001)
