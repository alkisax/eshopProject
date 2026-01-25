1) Namecheap DNS
Namecheap → Domain List → portfolio-projects.space → Advanced DNS:
Type: A
Host: delivery
Value: 49.12.76.128
TTL: Automatic

ping delivery.portfolio-projects.space

2) SSH στον Hetzner & νέο folder (SAFE)
ssh root@49.12.76.128
cd /var/www
mkdir -p eshopProject-delivery
cd eshopProject-delivery

3) Git clone & checkout ΜΟΝΟ το branch prototype/delivery
git clone https://github.com/alkisax/eshopProject.git .
git fetch --all
git checkout prototype/delivery
git status

4) Frontend build (Vite)
cd /var/www/eshopProject-delivery/frontend
npm install --legacy-peer-deps
nano .env

```
VITE_BACKEND_URL=https://delivery.portfolio-projects.space
VITE_FRONTEND_URL=https://delivery.portfolio-projects.space
```

npm run build

5) Backend build + PM2 (port 3007)
- λιγη προσοχή στο npm i -D @types/ws μπήκε για το socket 

cd /var/www/eshopProject-delivery/backend
npm install
npm i -D @types/ws
nano .env

```
BACK_END_PORT=3007
BACKEND_URL=https://delivery.portfolio-projects.space
FRONTEND_URL=https://delivery.portfolio-projects.space
DEPLOY_URL=https://delivery.portfolio-projects.space
```

rm -rf build
npm run build

pm2 start build/src/server.js --name eshop-backend-delivery
pm2 save
pm2 list
curl http://localhost:3007/api/ping; echo

6) Nginx νέο site file (ΔΕΝ αγγίζουμε τα άλλα)
nano /etc/nginx/sites-available/delivery.portfolio-projects.space

Note:
Το HTTPS (certbot / letsencrypt) θα προστεθεί σε επόμενο βήμα.
Προς το παρόν το site σερβίρεται σε HTTP.
```
server {
  listen 80;
  server_name delivery.portfolio-projects.space;

  location /api/ {
    proxy_pass http://localhost:3007;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
  }

  location / {
    root /var/www/eshopProject-delivery/frontend/dist;
    index index.html;
    try_files $uri $uri/ /index.html;
  }
}
```

ln -s /etc/nginx/sites-available/delivery.portfolio-projects.space /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx

curl -I http://delivery.portfolio-projects.space

7) Certbot / Let’s Encrypt (SAFE)
certbot --nginx -d delivery.portfolio-projects.space
nginx -t
systemctl reload nginx

curl -I https://delivery.portfolio-projects.space
curl -I https://delivery.portfolio-projects.space/api/ping

8) Διόρθωση για socket
nano /etc/nginx/sites-available/delivery.portfolio-projects.space

Πρόσθεσε ΑΚΡΙΒΩΣ ΑΥΤΟ block (δίπλα στο /api)
```
location /socket.io/ {
  proxy_pass http://localhost:3007/socket.io/;
  proxy_http_version 1.1;
  proxy_set_header Upgrade $http_upgrade;
  proxy_set_header Connection "Upgrade";
  proxy_set_header Host $host;
  proxy_set_header X-Real-IP $remote_addr;
  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  proxy_set_header X-Forwarded-Proto $scheme;
  proxy_read_timeout 86400;
}
```

nginx -t
systemctl reload nginx

9) ⚠️⚠️⚠️⚠️ δεν έχει ελεγχθει 
ssh root@49.12.76.128
cd /var/www/eshopProject-delivery \
&& git pull origin prototype/delivery \
&& cd frontend && npm install --legacy-peer-deps && npm run build \
&& cd ../backend && npm install && npm run build \
&& pm2 restart eshop-backend-delivery --update-env \
&& nginx -t && systemctl reload nginx \
&& sleep 2 \
&& curl -I https://delivery.portfolio-projects.space/api/ping; echo

- see backend logs: `pm2 logs eshop-backend-delivery --lines 200`
- clear logs: `pm2 flush eshop-backend-delivery`