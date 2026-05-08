#!/usr/bin/env bash
# Run this on each Linux VM: ubuntu-server-01, docker-host, dns-server, dev-machine
set -euo pipefail

VER="1.8.2"
ARCH="linux-amd64"
URL="https://github.com/prometheus/node_exporter/releases/download/v${VER}/node_exporter-${VER}.${ARCH}.tar.gz"

cd /tmp
curl -fsSL "$URL" | tar xz
sudo mv "node_exporter-${VER}.${ARCH}/node_exporter" /usr/local/bin/
rm -rf "node_exporter-${VER}.${ARCH}"

sudo useradd -rs /bin/false node_exporter 2>/dev/null || true

sudo tee /etc/systemd/system/node_exporter.service > /dev/null <<EOF
[Unit]
Description=Prometheus Node Exporter
After=network.target

[Service]
User=node_exporter
ExecStart=/usr/local/bin/node_exporter
Restart=on-failure

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable --now node_exporter
echo "node_exporter running on :9100"
