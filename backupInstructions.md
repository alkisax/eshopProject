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

