
#!/bin/bash
# sign_and_verify.sh - Signs all packages and verifies them using GPG

cd "$(dirname "$0")/../dist"

echo "[+] Generating SHA512 checksums..."
sha512sum *.AppImage *.deb *.exe *.pkg > checksums.sha512

echo "[+] Signing checksums with GPG..."
gpg --output checksums.sha512.asc --armor --sign checksums.sha512

echo "[+] Verifying signature..."
gpg --verify checksums.sha512.asc

echo "[+] Done. Packages signed and verified."
