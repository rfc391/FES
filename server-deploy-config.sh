#!/bin/bash

echo "[+] Deploying Tactical Personnel Management System"

# Purge old repo contents (except .git)
find . -mindepth 1 ! -regex '^./\.git\(/.*\)?' -delete

# Unzip the new repo
unzip personnel-management-system-secure.zip -d .

# Move contents out of nested folder if needed
mv personnel-management-system-secure/* .
rm -rf personnel-management-system-secure

# Run the install script
chmod +x scripts/install_all.sh
bash scripts/install_all.sh