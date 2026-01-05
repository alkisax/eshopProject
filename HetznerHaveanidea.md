ssh root@91.99.145.154
apt update && apt upgrade -y
apt install -y ufw git curl
ufw allow OpenSSH
ufw enable
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
node -v
npm -v
npm install -g pm2
pm2 -v
mkdir -p /var/www
cd /var/www
- δημιούργησα τοκεν απο github developer settings και το βάζω ως κωδικό
git clone https://github.com/haveanideashop/haveanideashop.git eshop
cd eshop
cd /var/www/eshop/backend
npm install
nano .env
- εδω πρέπει να βάλουμε τα env που είχα προβλημα
npm run build
pm2 start build/src/server.js --name eshop-backend
- μετα απο αλλαγές στο env αντι για start θέλω restart
pm2 restart eshop-backend --update-env
pm2 list
curl http://localhost:3001/api/ping; echo
cd /var/www/eshop/frontend
nano .env
npm install --legacy-peer-deps
npm run build
apt install -y nginx
nano /etc/nginx/sites-available/eshop
ln -s /etc/nginx/sites-available/eshop /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
ufw allow 'Nginx Full'
pm2 startup
pm2 save
- μετά απο διαφορες προσθήκες για να μπορώ να δω απο το front τα backend dist api-docs sitemap robots etc το nginx Μου γίνετε
```
server {
  server_name haveanidea.gr www.haveanidea.gr eshop.haveanidea.gr;

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
    root /var/www/eshop/backend/dist;
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
server {
    if ($host = eshop.haveanidea.gr) {
        return 301 https://$host$request_uri;
    } # managed by Certbot

    if ($host = www.haveanidea.gr) {
        return 301 https://$host$request_uri;
    } # managed by Certbot

    if ($host = haveanidea.gr) {
        return 301 https://$host$request_uri;
    } # managed by Certbot
  listen 80;
  server_name haveanidea.gr www.haveanidea.gr eshop.haveanidea.gr;
    return 404; # managed by Certbot
}
```

- αγόρασα απο papaki το domain haveanidea.gr
nano /etc/nginx/sites-available/eshop
```js
server {
  listen 80;
  server_name haveanidea.gr www.haveanidea.gr eshop.haveanidea.gr;

  location /api/ {
    proxy_pass http://localhost:3001;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  }

  location / {
    root /var/www/eshop/frontend/dist;
    index index.html;
    try_files $uri $uri/ /index.html;
  }
}
```
nginx -t && systemctl reload nginx
nano /var/www/eshop/backend/.env
pm2 restart eshop-backend --update-env
nano /var/www/eshop/frontend/.env
npm run build
ping haveanidea.gr

- ωσπου να εγγριθεί το domain θα τρέξουμε απο την ip
`curl http://91.99.145.154:3001/api/ping && echo`
και επισκεψη σε http://91.99.145.154
```
  Αν (προσωρινά) θες να το δεις από browser με IP ❌ (όχι recommended)
  ΜΟΝΟ για debug:
  ufw allow 3001
  Μετά:
  http://91.99.145.154:3001/api/ping
  ⚠️ Και μετά ΚΛΕΙΣΤΟ ΠΑΛΙ:
  ufw deny 3001
```
- κάναμε server_name haveanidea.gr www.haveanidea.gr eshop.haveanidea.gr; → server_name _;
rm /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

# Διάφορα αρχικοποίησης της λειτουργικότητας του frontend
Περάσαμε στην Mongo τον superadmin alkisax
Περάσαμε στο appwrite τον user
VITE_UPLOAD_USER=upload@eshop.local
VITE_UPLOAD_PASS=superSecretPass123
επιτρέψαμε στο appwrite το ανέβασμα εικονών (σε λιγο και excel)
κάναμε αλλαγές στο backend app σε cors και helmet

- για sync main και client:
```bash
git checkout main
git pull origin main
git merge wip
git push origin main
git push client main
git checkout wip
```
- για redeploy στον server
```bash
cd /var/www/eshop \
&& git pull origin main \
&& cd frontend \
&& npm install --legacy-peer-deps \
&& npm run build \
&& cd ../backend \
&& npm install \
&& npm run build \
&& pm2 restart eshop-backend --update-env \
&& nginx -t && systemctl reload nginx \
&& sleep 5 \
&& curl https://haveanidea.gr/api/ping; echo
```
Θυμίζω: token απο env για password
- η σελίδα πρέπει να προστεθεί και στο appwrite platform

αφου έκανε ping ο σερβερ
ping haveanidea.gr
nano /etc/nginx/sites-available/eshop

certbot --nginx \
  -d haveanidea.gr \
  -d www.haveanidea.gr \
  -d eshop.haveanidea.gr
curl https://haveanidea.gr/api/ping

- μετά απο αλλαγές σε .env
`pm2 restart eshop-backend --update-env`

# one line deploy
- για sync main και client:
```bash
# 1. δουλεύουμε στο wip
git checkout wip
git add .
git commit -m 'wip: ___'
git push origin wip
# 2. συγχρονίζουμε main = wip
git checkout main
git pull origin main
git merge wip
git push origin main
# 3. βρίσκουμε commit για client
git log --oneline -5
# 4. cherry-pick στο clients/eleni
git checkout clients/eleni
git pull origin clients/eleni
git cherry-pick <COMMIT_HASH>
git push origin clients/eleni
# 5. sync client repo main = clients/eleni
git push client clients/eleni:main
git checkout wip
```
```bash
ssh root@91.99.145.154
```
```bash
cd /var/www/eshop \
&& git pull origin main \
&& cd frontend \
&& npm install --legacy-peer-deps \
&& npm run build \
&& cd ../backend \
&& npm install \
&& npm run build \
&& NODE_ENV=production pm2 restart eshop-backend --update-env \
&& nginx -t && systemctl reload nginx \
&& sleep 5 \
&& curl https://haveanidea.gr/api/ping; echo
```

- see backend logs: `pm2 logs eshop-backend --out --lines 200`
- clear logs: `pm2 flush eshop-backend`