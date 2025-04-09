
#!/bin/bash
# Enforce SSH key-only login and disable password login

echo "[+] Locking down SSH to allow only GPG+SSH keys..."

SSHD_CONFIG="/etc/ssh/sshd_config"

# Backup first
cp $SSHD_CONFIG $SSHD_CONFIG.bak

# Disable password and root login
sed -i 's/^#PasswordAuthentication yes/PasswordAuthentication no/' $SSHD_CONFIG
sed -i 's/^PasswordAuthentication yes/PasswordAuthentication no/' $SSHD_CONFIG
sed -i 's/^PermitRootLogin yes/PermitRootLogin no/' $SSHD_CONFIG
echo "AuthenticationMethods publickey" >> $SSHD_CONFIG

systemctl reload sshd
echo "[+] SSH hardened. Only GPG+SSH keys are now accepted."
