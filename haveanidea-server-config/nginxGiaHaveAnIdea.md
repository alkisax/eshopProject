```nginx
##
## 1️⃣ HTTPS redirect: www → canonical
## (ΝΕΟ – ΠΡΩΤΟ ΣΤΟ ΑΡΧΕΙΟ)
##
server {
  listen 443 ssl;
  server_name www.haveanidea.gr;

  ssl_certificate /etc/letsencrypt/live/haveanidea.gr/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/haveanidea.gr/privkey.pem;
  include /etc/letsencrypt/options-ssl-nginx.conf;
  ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

  return 301 https://haveanidea.gr$request_uri;
}

##
## 2️⃣ MAIN HTTPS server (ΟΠΩΣ ΤΟ ΕΙΧΕΣ)
##
server {
  server_name haveanidea.gr;

  location = /sitemap.xml {
    proxy_pass http://localhost:3001/sitemap.xml;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }

  location /api-docs {
    proxy_pass http://localhost:3001/api-docs;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }

  location /api/ {
    proxy_pass http://localhost:3001;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  }

  location = /robots.txt {
    proxy_pass http://localhost:3001/robots.txt;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }

  location / {
    root /var/www/eshop/backend/dist;
    index index.html;
    try_files $uri $uri/ /index.html;
  }

  listen 443 ssl; # managed by Certbot
  ssl_certificate /etc/letsencrypt/live/haveanidea.gr/fullchain.pem; # managed by Certbot
  ssl_certificate_key /etc/letsencrypt/live/haveanidea.gr/privkey.pem; # managed by Certbot
  include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
  ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot
}

##
## 3️⃣ HTTP → HTTPS redirect (ΚΑΘΑΡΙΣΜΕΝΟ)
##
server {
  listen 80;
  server_name haveanidea.gr www.haveanidea.gr eshop.haveanidea.gr;
  return 301 https://haveanidea.gr$request_uri;
}

```