FROM python:3.12-slim

RUN pip install --no-cache-dir flask==3.1.1 gunicorn==23.0.0

WORKDIR /app
COPY zfs_agent.py .

EXPOSE 5001
# zpool/zfs binaries must exist on the host; mount them in or install zfsutils-linux
CMD ["gunicorn", "--bind", "0.0.0.0:5001", "--workers", "1", "zfs_agent:app"]
