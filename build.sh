
#!/bin/bash

set -e

APP_NAME="fes"
VERSION="1.0.0"
BUILD_DIR="build"
INSTALL_DIR="/opt/fes"

echo "[+] Cleaning previous builds..."
rm -rf $BUILD_DIR
mkdir -p $BUILD_DIR/DEBIAN
mkdir -p $BUILD_DIR$INSTALL_DIR
mkdir -p $BUILD_DIR/usr/bin

echo "[+] Copying application files..."
cp -r src core config scripts requirements.txt $BUILD_DIR$INSTALL_DIR

echo "[+] Creating launcher..."
echo -e "#!/bin/bash\npython3 $INSTALL_DIR/main.py \"$@\"" > $BUILD_DIR/usr/bin/fes
chmod +x $BUILD_DIR/usr/bin/fes

echo "[+] Writing control file..."
cat <<EOF > $BUILD_DIR/DEBIAN/control
Package: $APP_NAME
Version: $VERSION
Section: base
Priority: optional
Architecture: all
Depends: python3, python3-pip
Maintainer: robshubert96@gmail.com
Description: Field Extraction System (FES) - Automated Intelligence Framework
EOF

echo "[+] Building .deb package..."
dpkg-deb --build $BUILD_DIR fes-installer.deb

echo "[+] Preparing AppImage environment..."
mkdir -p AppDir/usr/bin
cp -r src core config scripts requirements.txt AppDir/usr/bin/
echo -e "#!/bin/bash\npython3 /usr/bin/main.py \"$@\"" > AppDir/AppRun
chmod +x AppDir/AppRun
echo "<AppImage metadata>" > AppDir/fes.desktop

echo "[+] Creating AppImage (stub - replace with appimagetool logic)..."
# Placeholder: Normally use appimagetool or appimage-builder here
tar -czf fes.AppImage.tar.gz AppDir

echo "[✔] Done! Built: fes-installer.deb and fes.AppImage.tar.gz"
