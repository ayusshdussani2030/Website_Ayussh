# bytefort.xyz — TODO

## 1. Real metrics on the website

- [ ] Build the metrics API container (`flask` + `psutil`) on docker-host VM
  - [x] `infra/metrics-api/metrics.py` — Flask app exposing `/metrics` JSON
  - [x] `infra/metrics-api/Dockerfile` + `infra/metrics-api/docker-compose.yml`
  - [ ] Copy to docker-host, run `docker compose up -d`, confirm JSON at `docker-host-ip:5000/metrics`
- [ ] Add proxy host `api.bytefort.xyz` in Nginx PM → docker-host:5000
- [ ] Enable SSL on `api.bytefort.xyz` in Nginx PM
- [ ] Add CORS header in Nginx PM: `Access-Control-Allow-Origin: https://bytefort.xyz`
- [x] Updated IIFE 12 in `script.js` — tries `fetch('https://api.bytefort.xyz/metrics')`, falls back to simulation if API is down. Maps `cpu`, `mem`, `net_up`, `net_dn`, `disk`, `temp`, `req` fields.
- [ ] Handle ZFS stats — run a second tiny agent on `ubuntu-server-01` that exposes `zpool list` output as JSON, proxy it through the main metrics server
- [ ] CPU temp — either skip it (show `--`) or SSH from a VM into ESXi management IP and pipe `esxcli hardware ipmi` into the metrics endpoint (harder)

## 2. Full ESXi host monitoring (Prometheus stack)

- [x] `infra/monitoring/docker-compose.yml` — vmware_exporter + prometheus + grafana, all wired together
- [x] `infra/monitoring/.env.example` — ESXi credentials + Grafana admin + Gmail App Password slots
- [ ] Fill in `.env` on docker-host with real ESXi IP + credentials
- [x] `infra/monitoring/prometheus.yml` — scrape config for ESXi via vmware_exporter + node_exporter on each VM (IPs are placeholders, update them)
- [x] `infra/monitoring/install-node-exporter.sh` — run this on each Linux VM to install node_exporter as a systemd service
- [ ] Run install script on: ubuntu-server-01, docker-host, dns-server, dev-machine
- [ ] Expose Grafana at `grafana.bytefort.xyz` via Nginx PM + Cloudflare Tunnel
- [ ] Import VMware ESXi dashboard from Grafana dashboard library (ID: 8168)
- [ ] Import Node Exporter dashboard (ID: 1860)

## 3. Email alerts (Grafana)

- [ ] Generate a Gmail App Password (Google Account → Security → 2FA → App Passwords)
- [ ] Fill `GMAIL_ADDRESS` + `GMAIL_APP_PASSWORD` in `infra/monitoring/.env`
- [x] `infra/monitoring/provisioning/alerting/rules.yml` — alert rules for CPU > 85%, RAM > 90%, temp > 70°C, disk > 80%, VM down. Auto-provisioned into Grafana on startup.
- [ ] Test each alert by triggering it manually

## 4. Service uptime monitoring (Uptime Kuma)

- [x] `infra/uptime-kuma/docker-compose.yml` — `louislam/uptime-kuma:1`
- [ ] Deploy on docker-host: `docker compose up -d`
- [ ] Expose at `status.bytefort.xyz` via Nginx PM + Cloudflare Tunnel
- [ ] Add monitor for each service: dash, jellyfin, jellyseerr, prowlarr, proxy, qbit, radarr, sonarr, vmware, wetty
- [ ] Configure email notifications in Uptime Kuma → Settings → Notifications
- [ ] Make public status page in Uptime Kuma (link it from the website footer)

## 5. External monitoring — power outage / ISP down detection

- [ ] Sign up for Uptime Robot free tier (uptimerobot.com) — monitors from outside your network
- [ ] Add monitor for `bytefort.xyz` — set alert contact to email
- [ ] Add monitor for `jellyfin.bytefort.xyz`
- [ ] Set check interval to 5 minutes (free tier limit)
- [ ] Optionally: add BetterUptime as a second external monitor for redundancy

## 6. Website CSS + JS for new sections

- [x] Fixed `.tlm-stats` grid layout — was orphaning to a half-row at ≤1024px; now `grid-column: span 2` at that breakpoint
- [x] Added missing `disk` metric handler in IIFE 12 — was static before, now animates and updates fill bar from API or simulation
- [x] Timeline rail animation (`railFlow` keyframe) — verified correct in code
- [x] `--line`, `--line-mid`, `--line-strong` tokens — verified consistent; legacy `--border*` aliases preserved
- [x] `--cyan: #67e8f9` and `--green: #4ade80` — verified consistent across all sections

## 7. Nice to have (later)

- [ ] Wire the live log feed (`#tlmLog`) to actual Nginx access logs via a WebSocket or SSE endpoint
- [ ] Add a public Grafana embed (read-only) iframe into the telemetry section (needs Grafana running first — section 2)
- [ ] UPS integration — if you get a UPS, hook it up to Network UPS Tools (NUT) and expose battery/runtime via the metrics API
- [ ] k3s cluster (mentioned in timeline section as next goal)
- [ ] GPU passthrough for better local LLM inference
