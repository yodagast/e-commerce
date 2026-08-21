#!/usr/bin/env bash
# 电商独立站启动脚本
#
# 【为什么从服务器外部无法访问？】
# 之前用 --host 127.0.0.1 只会绑定「回环地址」，仅允许本机访问，
# 服务器的公网/内网 IP 及外部浏览器都连不进来。
# 这里改为 --host 0.0.0.0，监听所有网络接口，外网即可通过
# http://服务器IP:8010 访问（需同时放行防火墙/安全组的 8010 端口）。
set -e

HOST="${HOST:-0.0.0.0}"
PORT="${PORT:-8010}"

cd "$(dirname "$0")"
echo "启动电商独立站: http://${HOST}:${PORT}  (外网用服务器 IP 访问)"
exec .venv/bin/uvicorn main:app --host "$HOST" --port "$PORT"