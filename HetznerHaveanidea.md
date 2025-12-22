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
curl http://91.99.145.154:3001/api/ping && echo
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
