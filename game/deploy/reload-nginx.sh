#!/bin/sh
set -eu

# Certbot 续期成功后只做语法校验与平滑重载，不重启现有连接或容器。
nginx -t
systemctl reload nginx
