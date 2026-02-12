# local run
μπάινουμε λινουξ → Κατεβάζει το public key της MongoDB → Προσθέτει external repository → κατεβάζει MONO τα mongo tools → φτιαχνουμε φάκελο bakcup μέσα στο wsl → φτιαχνουμε script και το κάνουμε executable
```bash
wsl
which mongodump

curl -fsSL https://pgp.mongodb.com/server-7.0.asc | \
sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor

echo "deb [ arch=amd64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | \
sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

sudo apt update

sudo apt install mongodb-database-tools

which mongodump
mongodump --version

mkdir -p ~/coding/backup
ls ~/coding
cd /mnt/d/coding//eshopProject//backend/scripts
nano atlas-backup-local.sh
chmod +x atlas-backup-local.sh
./atlas-backup-local.sh
```
→ είχαμε προβλημα με τις CRLF καταλήψεις για να τρέξουμε το script
`sudo apt install dos2unix`
`dos2unix /mnt/d/coding/eshopProject/backend/.env`

- script
```sh
#!/bin/bash
# Path στο project backend
BACKEND_PATH="/mnt/d/coding/eshopProject/backend"
# Path για backup μέσα στο WSL
BACKUP_DIR="$HOME/coding/backup"
# Δημιουργία backup folder αν δεν υπάρχει
mkdir -p "$BACKUP_DIR"
# Φόρτωση ΜΟΝΟ μέσα στο script
MONGO_URI=$(grep '^MONGODB_URI=' "$BACKEND_PATH/.env" | sed 's/^MONGODB_URI=//')
# Debug check
# echo "uri = ${MONGO_URI}"
echo "URI length: ${#MONGO_URI}"
DATE=$(date +"%Y-%m-%d_%H-%M")
/usr/bin/mongodump \
  --uri="$MONGO_URI" \
  --archive="$BACKUP_DIR/backup_$DATE.gz" \
  --gzip
```


# στο Hetzner εγκαταστη MongoDB CLI backup tools
```bash
curl -fsSL https://pgp.mongodb.com/server-7.0.asc | \
sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
```
Κατεβάζει το public key της MongoDB
Το αποθηκεύει στο σύστημα
Επιτρέπει στο apt να εμπιστεύεται τα πακέτα του Mongo repo
- Προσθέσαμε MongoDB repository
```bash
echo "deb [ arch=amd64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | \
sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
```
Προσθέτει external repository
Λέει στο apt: "ψάξε και εδώ για πακέτα"
- Εγκαταστήσαμε μόνο τα tools
sudo apt install mongodb-database-tools
-Επιβεβαιώσαμε εγκατάσταση
```bash
which mongodump
mongodump --version
```
Αυτό μας έδειξε:
/usr/bin/mongodump
version 100.14.1

# δημιουργία backup folder και mongo script
(φτιάχνουμε φάκελο και δίνουμε δικαιόματα μόνο σε root)
```bash
sudo mkdir -p /var/backups/eshopProject
sudo chown root:root /var/backups/eshopProject
```
cd /var/www/eshopProject/backend

φεραμε το script μέσο git add commit push pull. αλλα επειδή έχει μέσα την γραμμή `BACKEND_PATH="/mnt/d/coding/eshopProject/backend"` θα πρέπει να τιάξουμε ένα sever specific script

`nano atlas-backup-hetzner.sh`
```sh
#!/bin/bash

BACKEND_PATH="/var/www/eshopProject/backend"
BACKUP_DIR="/var/backups/eshopProject"

mkdir -p "$BACKUP_DIR"

MONGO_URI=$(grep '^MONGODB_URI=' "$BACKEND_PATH/.env" | cut -d '=' -f2-)

if [ -z "$MONGO_URI" ]; then
  echo "MONGODB_URI not found!"
  exit 1
fi

DATE=$(date +"%Y-%m-%d_%H-%M")

/usr/bin/mongodump \
  --uri="$MONGO_URI" \
  --archive="$BACKUP_DIR/backup_$DATE.gz" \
  --gzip

# 🔥 Retention policy: κρατάμε μόνο το πιο πρόσφατο backup
# Παίρνουμε λίστα backup ταξινομημένα από το νεότερο στο παλαιότερο
BACKUP_FILES=$(ls -t "$BACKUP_DIR"/backup_*.gz 2>/dev/null)
# Μετράμε πόσα υπάρχουν
FILE_COUNT=$(echo "$BACKUP_FILES" | wc -l)
# Αν υπάρχουν περισσότερα από 1
if [ "$FILE_COUNT" -gt 1 ]; then
  # Παίρνουμε όλα εκτός από το πρώτο (δηλαδή κρατάμε το νεότερο)
  FILES_TO_DELETE=$(echo "$BACKUP_FILES" | tail -n +2)
  # Διαγράφουμε τα παλιά
  for FILE in $FILES_TO_DELETE; do
    echo "Deleting old backup: $FILE"
    rm "$FILE"
  done
fi

echo "Backup completed at $DATE"
```
chmod +x atlas-backup-hetzner.sh
./atlas-backup-hetzner.sh

# cron
crontab -e

- ανα δύο λεπτα
```
*/2 * * * * /var/www/eshopProject/backend/scripts/atlas-backup-hetzner.sh >> /var/backups/eshopProject/cron.log 2>&1
```
- κάθε πέμτη 9:30UTC → 11:30 ελλάδας
```
30 9 * * 4 /var/www/eshopProject/backend/scripts/atlas-backup-hetzner.sh >> /var/backups/eshopProject/cron.log 2>&1
```

ls -lh /var/backups/eshopProject

# nginx backup
sudo mkdir -p /var/backups/nginx
```sh
#!/bin/bash

BACKUP_DIR="/var/backups/nginx"
DATE=$(date +"%Y-%m-%d_%H-%M")

mkdir -p "$BACKUP_DIR"

tar -czf "$BACKUP_DIR/nginx_backup_$DATE.tar.gz" \
  /etc/nginx/nginx.conf \
  /etc/nginx/sites-available \
  /etc/nginx/sites-enabled

# Retention: κρατάμε μόνο το πιο πρόσφατο
BACKUP_FILES=$(ls -t "$BACKUP_DIR"/nginx_backup_*.tar.gz 2>/dev/null)
FILE_COUNT=$(echo "$BACKUP_FILES" | wc -l)

if [ "$FILE_COUNT" -gt 1 ]; then
  FILES_TO_DELETE=$(echo "$BACKUP_FILES" | tail -n +2)
  for FILE in $FILES_TO_DELETE; do
    echo "Deleting old nginx backup: $FILE"
    rm "$FILE"
  done
fi  

echo "Nginx backup completed at $DATE"
```
sudo chmod +x
./nginx-backup.sh
ls -lh /var/backups/nginx

# .env
nano env-backup.sh
```sh
#!/bin/bash

BACKUP_DIR="/var/backups/eshopProject"
BACKEND_ENV="/var/www/eshopProject/backend/.env"
FRONTEND_ENV="/var/www/eshopProject/frontend/.env"

DATE=$(date +"%Y-%m-%d_%H-%M")

mkdir -p "$BACKUP_DIR"

# Backup backend .env
if [ -f "$BACKEND_ENV" ]; then
  cp "$BACKEND_ENV" "$BACKUP_DIR/backend_env_$DATE"
else
  echo "Backend .env not found!"
fi

# Backup frontend .env
if [ -f "$FRONTEND_ENV" ]; then
  cp "$FRONTEND_ENV" "$BACKUP_DIR/frontend_env_$DATE"
else
  echo "Frontend .env not found!"
fi

# Retention: κρατάμε μόνο το πιο πρόσφατο backend env
BACKEND_FILES=$(ls -t "$BACKUP_DIR"/backend_env_* 2>/dev/null)
if [ "$(echo "$BACKEND_FILES" | wc -l)" -gt 1 ]; then
  echo "$BACKEND_FILES" | tail -n +2 | xargs rm -f
fi

# Retention: κρατάμε μόνο το πιο πρόσφατο frontend env
FRONTEND_FILES=$(ls -t "$BACKUP_DIR"/frontend_env_* 2>/dev/null)
if [ "$(echo "$FRONTEND_FILES" | wc -l)" -gt 1 ]; then
  echo "$FRONTEND_FILES" | tail -n +2 | xargs rm -f
fi

echo ".env backup completed at $DATE"
```
chmod +x env-backup.sh
./env-backup.sh
ls -lh /var/backups/eshopProject

```
55 9 * * 4 /var/www/eshopProject/backend/scripts/env-backup.sh >> /var/backups/eshopProject/cron.log 2>&1
```

- τα αλλάξαμε σε ↓ για να μην γεμίζει το log μου ('>' αντι για '>>')
```
15 10 * * 4 /var/www/eshopProject/backend/scripts/atlas-backup-hetzner.sh > /var/backups/eshopProject/mongo.log 2>&1
17 10 * * 4 /var/www/eshopProject/backend/scripts/nginx-backup.sh > /var/backups/nginx/nginx.log 2>&1
19 10 * * 4 /var/www/eshopProject/backend/scripts/env-backup.sh > /var/backups/eshopProject/env.log 2>&1
```

# αποθήκευση στον σκληρό
απο powershell
```bash
mkdir D:\hetzner-backups
scp -r root@49.12.76.128:/var/backups D:\hetzner-backups\
```
