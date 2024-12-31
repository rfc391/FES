
{ pkgs }: {
  deps = [
    pkgs.geckodriver
    pkgs.xsimd
    pkgs.glibcLocales
    pkgs.tk
    pkgs.tcl
    pkgs.qhull
    pkgs.ghostscript
    pkgs.freetype
    pkgs.ffmpeg-full
    pkgs.rustc
    pkgs.openssl
    pkgs.libxcrypt
    pkgs.libiconv
    pkgs.cargo
    pkgs.python312
    pkgs.qt5.full
    pkgs.fontconfig
    pkgs.libGL
    pkgs.gtk3
    pkgs.pkg-config
    pkgs.gobject-introspection
    pkgs.cairo
    pkgs.xorg.libX11
    pkgs.xorg.libXrender
    pkgs.xorg.libXext
    pkgs.xorg.libxcb
    pkgs.xorg.xcbutilwm
    pkgs.xorg.xcbutilimage
    pkgs.xorg.xcbutilkeysyms
    pkgs.xorg.xcbutilrenderutil
  ];
}
