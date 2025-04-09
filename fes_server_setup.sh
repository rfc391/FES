
#!/bin/bash
# FES Hardened Server Setup Script

echo "[*] Updating system..."
sudo apt update && sudo apt upgrade -y

echo "[*] Installing core dependencies..."
sudo apt install -y git gpg mosquitto mosquitto-clients python3-pip fail2ban monit net-tools ufw apparmor docker.io docker-compose mkdocs

echo "[*] Enabling UFW with strict rules..."
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp
sudo ufw allow 1883/tcp
sudo ufw allow 8080/tcp
sudo ufw allow 80/tcp
sudo ufw --force enable

echo "[*] Creating secure FES directory..."
sudo mkdir -p /opt/fes
sudo chown $USER:$USER /opt/fes
cp -r ./FES-hardened/* /opt/fes/

echo "[*] Pulling containers and building..."
cd /opt/fes/docker
docker-compose build
docker-compose up -d

echo "[*] Finalizing GPG/SSH integration..."
./scripts/enforce_ssh_only.sh

echo "[*] Securing complete. Run './launcher.py' to start FES."
