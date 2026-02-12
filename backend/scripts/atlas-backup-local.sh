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
