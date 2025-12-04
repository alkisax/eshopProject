# 🚀 Deploying a MERN App on Hetzner Cloud (Full Tutorial)

This guide explains **step-by-step** how to deploy your MERN (MongoDB,
Express, React, Node.js) app on a **Hetzner Cloud VPS**, make it
accessible via the internet, and manage it safely and professionally.

------------------------------------------------------------------------

## 🧩 Part 1 --- Initial Connection & System Setup

### 🎯 Goal:

Connect to your new Hetzner VPS and make sure it's ready to host web
apps.

### 🪜 Steps:

**1️⃣ Connect via SSH**

``` bash
ssh root@49.12.76.128
```

→ Connects to your remote server as the root user.

**2️⃣ Check that PM2 processes exist**

``` bash
pm2 list
```

**3️⃣ Update your system**

``` bash
apt update && apt upgrade -y
```

-   `apt update`: refreshes the list of available packages.\
-   `apt upgrade -y`: upgrades all packages automatically.

**4️⃣ Install basic tools**

``` bash
apt install -y git curl ufw
```

-   `git`: for cloning repositories.\
-   `curl`: for testing APIs or downloading scripts.\
-   `ufw`: Ubuntu's firewall utility.

**5️⃣ Allow SSH and enable the firewall**

``` bash
ufw allow OpenSSH
ufw enable
```

-   Opens port 22 (SSH).\
-   Enables the firewall so only allowed ports can be accessed.

------------------------------------------------------------------------

## 🧩 Part 2 --- Install Node.js & PM2

### 🎯 Goal:

Install the runtime (Node.js) and a process manager (PM2) to keep your
app running 24/7.

**1️⃣ Install Node.js 20 (LTS)**

``` bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -


apt install -y nodejs
```
- -fsSL → σημαίνει "quiet mode, show errors, follow redirects".
- | bash - → "πάρε το script που κατέβασες και εκτέλεσέ το με bash".

**2️⃣ Verify installation**

``` bash
node -v
npm -v
```

**3️⃣ Install PM2 globally**

``` bash
npm install -g pm2
pm2 -v
```

-   PM2 ensures your Node apps stay alive and restart automatically on
    crashes.

------------------------------------------------------------------------

## 🧩 Part 3 --- Project Folder & Repository

### 🎯 Goal:

Organize multiple apps on the same VPS under `/var/www`.

**1️⃣ Create your workspace**

``` bash
mkdir -p /var/www
cd /var/www
```

**2️⃣ Example structure**

    /var/www/
     ├─ ragAttemptProjectMarx/
     │   └─ backend/
     ├─ sharedFeesProject/
     │   └─ backend/
     ├─ biasedTarot/
     │   └─ backend/
     └─ wordpressSite/
         └─ public_html/

Each app runs on a separate port (e.g. 3001, 3002, 3003) and can have
its own Nginx config.

**3️⃣ Clone your repository**

``` bash
git clone https://github.com/alkisax/ragAttemptProjectMarx.git
cd ragAttemptProjectMarx/backend
```

------------------------------------------------------------------------

## 🧩 Part 4 --- Build and Run Your Backend

### 🎯 Goal:

Install dependencies, build the backend, and run it with PM2.

``` bash
npm install
npm run build
```

If frontend not built yet, do:

``` bash
cd ../frontend
npm install
npm run build
cd ../backend
npm run build
pm2 start build/src/server.js --name marx-rag
curl http://localhost:3001/api/ping
```

✅ Expected output: `pong`

------------------------------------------------------------------------

## 🧩 Part 5 --- Environment Variables

### 🎯 Goal:

Create your `.env` file and reload PM2 with it.

**1️⃣ Create the file**

``` bash
nano .env
```

Add your content, then save with:

    Ctrl + O → Enter → Ctrl + X

**2️⃣ Restart the process**

``` bash
pm2 delete marx-rag
pm2 start build/src/server.js --name marx-rag
curl http://localhost:3001/api/ping
```

**3️⃣ Test full functionality**

``` bash
curl -s -X POST http://localhost:3001/api/rag/ask-extended-hybrid   -H "Content-Type: application/json"   -d '{"query": "division of labor"}' | head -c 500; echo
```

**4️⃣ View logs**

``` bash
pm2 logs marx-rag --lines 20
```

**5️⃣ Clear logs**

``` bash
pm2 flush
```

------------------------------------------------------------------------

## 🧩 Part 6 --- Access from the Internet

### 🎯 Goal:

Allow your app to be visible to the public internet.

**1️⃣ Open the backend port**

``` bash
ufw allow 3001
```

✅ Now anyone can access `http://49.12.76.128:3001/api/ping`.

**2️⃣ When you want to close it:**

``` bash
ufw deny 3001
```

------------------------------------------------------------------------

## 🧩 Part 7 --- Install and Configure Nginx

### 🎯 Goal:

Use Nginx to serve your app at `http://49.12.76.128` (no `:3001`).

**1️⃣ Install Nginx**

``` bash
apt install -y nginx
systemctl status nginx
```

**2️⃣ Allow Nginx in firewall**

``` bash
ufw allow 'Nginx Full'
```

**3️⃣ Create new configuration**

``` bash
nano /etc/nginx/sites-available/marx-rag
```

Paste this:

``` nginx
server {
  listen 80;
  server_name 49.12.76.128;

  location / {
    proxy_pass http://localhost:3001;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
  }
}
```

Save & exit (Ctrl + O → Enter → Ctrl + X)

**4️⃣ Enable it**

``` bash
ln -s /etc/nginx/sites-available/marx-rag /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

✅ Test in browser → <http://49.12.76.128>

------------------------------------------------------------------------

## 🧩 Part 8 --- Frontend Fix (Vite Environment)

### 🎯 Goal:

Point your frontend build to the public backend URL.

**1️⃣ Edit frontend .env**

``` bash
cd /var/www/ragAttemptProjectMarx/frontend
nano .env
```

Set:

    VITE_BACKEND_URL=http://49.12.76.128

**2️⃣ Rebuild frontend & backend**

``` bash
npm run build
cd ../backend
npm run build
pm2 restart marx-rag
```

✅ Now frontend requests go to the live server instead of `localhost`.

------------------------------------------------------------------------

## 🧩 Part 9 --- Useful PM2 Commands

  Command                  Description
  ------------------------ -----------------------------------------
  `pm2 list`               Shows all running processes
  `pm2 stop marx-rag`      Stops the app
  `pm2 restart marx-rag`   Restarts the app
  `pm2 logs marx-rag`      Shows logs
  `pm2 flush`              Clears all logs
  `pm2 startup`            Generates a startup script for auto-run
  `pm2 save`               Saves current state for next reboot

------------------------------------------------------------------------

## 🧩 Part 10 --- Extra Tips

-   If you reboot the VPS, run once:

    ``` bash
    pm2 startup
    pm2 save
    ```

    This ensures your apps start automatically on boot.

-   To add a new app, just make a new folder in `/var/www` and repeat
    the process with a new port.

------------------------------------------------------------------------

🎉 **Done!**\
You now have a fully working, production-ready MERN deployment on
Hetzner Cloud.

## adding more apps
### adding second app
```bash
cd /var/www
git clone https://github.com/alkisax/ragKuhnChatWithDocument.git kuhn
cd kuhn/frontend
npm install
nano .env
```
```
VITE_BACKEND_URL=http://49.12.76.128/kuhn
```
```bash
npm run build
cd ../backend
nano .env
```
```
BACK_END_PORT=3002
MONGODB_URI=your_mongodb_uri_here
OPENAI_API_KEY=your_openai_key_here
BACKEND_URL=http://49.12.76.128:3002
FRONTEND_URL=http://49.12.76.128/kuhn
```
```bash
npm run build
pm2 restart kuhn-rag --update-env

pm2 start build/src/server.js --name kuhn-rag
curl http://localhost:3001/api/ping
npm install
npm run build
pm2 restart kuhn-rag
```

```
systemctl status nginx
// σβηνωτ ο παλιο και το φτιάχνω απο την αρχη
rm /etc/nginx/sites-available/marx-rag
rm /etc/nginx/sites-enabled/marx-rag
nano /etc/nginx/sites-available/rag-multi
```
```nginx
server {
  listen 80;
  server_name 49.12.76.128;

  # 📚 Kuhn app → main site (/)
  location / {
    proxy_pass http://localhost:3002;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
  }

  # 🧠 Marx app → served under /capital
  location /capital/ {
    rewrite ^/capital(/.*)$ $1 break;
    proxy_pass http://localhost:3001;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
  }
}
```
```bash
ln -s /etc/nginx/sites-available/rag-multi /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
curl http://49.12.76.128/api/ping; echo
curl http://49.12.76.128/capital/api/ping; echo

```

### adding a third app
```bash
cd /var/www
git clone https://github.com/alkisax/ragAttemptProject mao
cd mao/frontend
npm install
nano .env
```
```bash
VITE_BACKEND_URL=http://49.12.76.128/mao
```
```bash
nano vite.config.ts
```
```bash
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// https://vite.dev/config/
export default defineConfig({
  base: '/mao/',
  plugins: [react()],
})
```
```bash
npm run build
cd ../backend
nano .env
```
```bash
BACK_END_PORT=3003
MONGODB_URI=your_mongodb_uri_here
OPENAI_API_KEY=your_openai_key_here
BACKEND_URL=http://49.12.76.128:3003
FRONTEND_URL=http://49.12.76.128/mao
```
```bash
npm install typescript --save-dev
npm run build
pm2 start build/src/server.js --name mao-rag
curl http://localhost:3003/api/ping; echo
systemctl status nginx
nano /etc/nginx/sites-available/rag-multi
```
```nginx
server {
  listen 80;
  server_name 49.12.76.128;

  # Kuhn app → main site (/)
  location / {
    proxy_pass http://localhost:3002;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
  }

  # Marx app → served under /capital
  location /capital/ {
    rewrite ^/capital(/.*)$ $1 break;
    proxy_pass http://localhost:3001;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
  }

  # Mao app → served under /mao
  location /mao/ {
    rewrite ^/mao(/.*)$ $1 break;
    proxy_pass http://localhost:3003;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
  }
}
```
```bash
ln -s /etc/nginx/sites-available/rag-multi /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx

curl http://49.12.76.128/api/ping; echo
curl http://49.12.76.128/capital/api/ping; echo
curl http://49.12.76.128/mao/api/ping; echo
```
### deploy changes
```bash
ssh root@49.12.76.128
cd /var/www
cd ragAttemptProjectMarx/
git pull origin main
cd frontend
nano .env
npm install
npm run build
cd ../backend
nano .env
npm install
npm run build
pm2 list
pm2 restart marx-rag --update-env
nginx -t
systemctl reload nginx
curl http://localhost:3002/api/ping
```

οι ίδιες εντολές χωρίς nano για .env για να τις κάνω copy paste
```bash
ssh root@49.12.76.128
cd /var/www
cd ragAttemptProjectMarx/
git pull origin main
cd frontend
npm install
npm run build
cd ../backend
npm install
npm run build
pm2 list
pm2 restart marx-rag --update-env
nginx -t
systemctl reload nginx
curl http://localhost:3002/api/ping
```

```bash
cd /var/www && cd ragAttemptProjectMarx && git pull origin main && cd frontend && npm install && npm run build && cd ../backend && npm install && npm run build && pm2 list && pm2 restart marx-rag --update-env && nginx -t && systemctl reload nginx && curl http://localhost:3002/api/ping; echo
```

# domain
// αγοράστικε το portfolio-projects.space απο namecheap 1.98$ 31/10/2025
Στον πίνακα Namecheap → Domain List → portfolio-projects.space → Advanced DNS
| Type | Host  | Value (IP address) | TTL       |
| ---- | ----- | ------------------ | --------- |
| A    | `@`   | `49.12.76.128`     | Automatic |
| A    | `www` | `49.12.76.128`     | Automatic |

εκανα `ping portfolio-projects.space` και έλαβα
```
Pinging portfolio-projects.space [49.12.76.128] with 32 bytes of data:
Reply from 49.12.76.128: bytes=32 time=78ms TTL=43
Reply from 49.12.76.128: bytes=32 time=1070ms TTL=43
Reply from 49.12.76.128: bytes=32 time=78ms TTL=43
Reply from 49.12.76.128: bytes=32 time=99ms TTL=43

Ping statistics for 49.12.76.128:
    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss),
Approximate round trip times in milli-seconds:
    Minimum = 78ms, Maximum = 1070ms, Average = 331ms
```

συνδέομαι στον server
`ssh root@49.12.76.128`

Εγκατέστησε Certbot (αν δεν υπάρχει):
```bash
sudo apt update
sudo apt install certbot python3-certbot-nginx -y
```

αυτό Θα κάνει αυτόματα: Έλεγχο DNS, Δημιουργία SSL certificate, Προσθήκη HTTPS 
```bash
config στο Nginx.
sudo certbot --nginx -d portfolio-projects.space -d www.portfolio-projects.space
```

έλεγχος
`sudo systemctl reload nginx`
και επισκεψη στο https://portfolio-projects.space

Τώρα πρέπει να ενημερώσουμε το nginx config ώστε το domain σου να δείχνει προς τα projects που ήδη τρέχουν (kuhn, marx, mao). 
`sudo nano /etc/nginx/sites-available/portfolio-projects.space`

```nginx
# Redirect HTTP → HTTPS
server {
  listen 80;
  server_name portfolio-projects.space www.portfolio-projects.space;
  return 301 https://$host$request_uri;
}

# HTTPS version
server {
  listen 443 ssl;
  server_name portfolio-projects.space www.portfolio-projects.space;

  ssl_certificate /etc/letsencrypt/live/portfolio-projects.space/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/portfolio-projects.space/privkey.pem;

  # KUHN app → main site (/)
  location / {
    proxy_pass http://localhost:3002;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
  }

  # MARX app → served under /capital
  location /capital/ {
    rewrite ^/capital(/.*)$ $1 break;
    proxy_pass http://localhost:3001;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
  }

  # MAO app → served under /mao
  location /mao/ {
    rewrite ^/mao(/.*)$ $1 break;
    proxy_pass http://localhost:3003;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
  }
}
```

Ενεργοποίηση
```bash
sudo ln -s /etc/nginx/sites-available/portfolio-projects.space /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

αλλάζω τα .env 
απο 
VITE_BACKEND_URL=http://49.12.76.128/capital
σε
VITE_BACKEND_URL=https://portfolio-projects.space/capital
και απο 
FRONTEND_URL=http://49.12.76.128/capital/
σε
FRONTEND_URL=http://portfolio-projects.space/capital/
χρειάζετε restart για να φορτωθούν τα .env

# adding wordpress
1. 
Namecheap → Domain List → portfolio-projects.space → Advanced DNS.
Type	Host	 Value	       TTL
A	     wp	   49.12.76.128	  Automatic

και για δοκιμή μπαίνω στον σερβερ 
`ssh root@49.12.76.128`
`ping wp.portfolio-projects.space`

2. Install the LAMP base for WordPress (Apache or Nginx + PHP + MariaDB)
- Nginx → your web server
- MariaDB → database engine
- PHP 8.2+ FPM → WordPress runtime
- plus all essential PHP extensions
```bash
apt update && apt upgrade -y
apt install nginx mariadb-server php-fpm php-mysql php-cli php-curl php-xml php-gd php-mbstring unzip -y
```
- εκκίνηση  
enable → ensures the service starts automatically on reboot  
start → runs it immediately right now
```bash
systemctl enable nginx
systemctl enable mariadb
systemctl enable php8.3-fpm

systemctl start nginx
systemctl start mariadb
systemctl start php8.3-fpm
```
- MariaDB
`mysql_secure_installation`
- check
```bash
nginx -v
php -v
mysql -V
```

3. Create the WordPress database + Nginx server block
`mysql -u root` μπαίνω στο cli του mysql

- Create the database and user
αυτες ΜΙΑ - ΜΙΑ
```bash
CREATE DATABASE wordpress CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'wpuser'@'localhost' IDENTIFIED BY '2102011895';
GRANT ALL PRIVILEGES ON wordpress.* TO 'wpuser'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

- Create WordPress folder
```bash
mkdir -p /var/www/wplearn
cd /var/www/wplearn
wget https://wordpress.org/latest.tar.gz
tar -xvzf latest.tar.gz --strip-components=1
chown -R www-data:www-data /var/www/wplearn
```

- Create the Nginx configuration
`nano /etc/nginx/sites-available/wp.portfolio-projects.space`

```nginx
server {
    listen 80;
    server_name wp.portfolio-projects.space;
    root /var/www/wplearn;
    index index.php index.html;

    access_log /var/log/nginx/wp.access.log;
    error_log /var/log/nginx/wp.error.log;

    location / {
        try_files $uri $uri/ /index.php?$args;
    }

    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/run/php/php8.3-fpm.sock;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires max;
        log_not_found off;
    }
}
```

enable it  
```bash
ln -s /etc/nginx/sites-available/wp.portfolio-projects.space /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

- Add HTTPS with Certbot
`sudo certbot --nginx -d wp.portfolio-projects.space`

**τωρα αν επισκευτώ την  `https://wp.portfolio-projects.space`** λειτουργεί  
Field	| Value
Database name:	wordpress
Database username:	wpuser
Database password	2102011...
Database host:	localhost
Table prefix:	wp_ (leave as is)

site title: learnwp
username: alkisax
password: 2102011...
email: alkisax@gmail.com

- Go to
Settings → Permalinks → Post name → Save
→ This ensures Nginx rewrite rules are correct.

# eshop deploy
```bash
ssh root@49.12.76.128
cd /var/www
git clone https://github.com/alkisax/eshopProject
cd eshopProject
cd frontend
npm install --legacy-peer-deps
nano .env
```
```
  → VITE_BACKEND_URL=https://eshop.portfolio-projects.space
  → VITE_FRONTEND_URL=https://eshop.portfolio-projects.space
```
```bash
npm run build
cd ../backend
npm install
nano .env
```
```
  → add BACK_END_PORT=3004
  → BACKEND_URL=https://eshop.portfolio-projects.space
  → FRONTEND_URL=https://eshop.portfolio-projects.space
  → DEPLOY_URL=https://eshop.portfolio-projects.space
```
```bash
npm run build
pm2 start build/src/server.js --name eshop-backend
```
→ Namecheap → Domain List → portfolio-projects.space → Advanced DNS
Type	Host	Value	        TTL
A	    eshop	49.12.76.128	Automatic
```bash
ping eshop.portfolio-projects.space;echo
nano /etc/nginx/sites-available/eshop.portfolio-projects.space
```
```nginx
# Redirect HTTP → HTTPS
server {
  listen 80;
  server_name eshop.portfolio-projects.space;
  return 301 https://$host$request_uri;
}

# HTTPS version
server {
  listen 443 ssl;
  server_name eshop.portfolio-projects.space;

  ssl_certificate /etc/letsencrypt/live/portfolio-projects.space/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/portfolio-projects.space/privkey.pem;

  # API → Node backend
  location /api/ {
    proxy_pass http://localhost:3004;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
  }

  # Frontend (static build)
  location / {
    root /var/www/eshopProject/frontend/dist;
    index index.html;
    try_files $uri $uri/ /index.html;
  }
}
```
```bash
ln -s /etc/nginx/sites-available/eshop.portfolio-projects.space /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx

sudo certbot --nginx -d eshop.portfolio-projects.space
sudo systemctl reload nginx
```

## deploy latest commit
ssh root@49.12.76.128
```bash
cd /var/www && cd eshopProject && git pull origin main && cd frontend && npm install --legacy-peer-deps && npm run build && cd ../backend && npm install && npm run build && pm2 list && pm2 restart eshop-backend --update-env && nginx -t && systemctl reload nginx && sleep 5 && curl http://localhost:3004/api/ping; echo
```

