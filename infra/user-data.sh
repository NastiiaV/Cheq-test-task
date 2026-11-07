#!/bin/bash
set -euo pipefail

dnf install -y docker nginx
systemctl enable --now docker
usermod -aG docker ec2-user
mkdir -p /var/www/tasks

cat >/etc/nginx/nginx.conf <<'EOF'
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log;
pid /run/nginx.pid;

events {
  worker_connections 1024;
}

http {
  include /etc/nginx/mime.types;
  default_type application/octet-stream;
  sendfile on;

  server {
    listen 80;
    server_name _;
    root /var/www/tasks;
    index index.html;

    location /health {
      proxy_pass http://127.0.0.1:3000;
    }

    location /tasks {
      proxy_pass http://127.0.0.1:3000;
    }

    location / {
      try_files $uri $uri/ /index.html;
    }
  }
}
EOF

systemctl enable --now nginx
