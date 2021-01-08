#!/bin/bash

#build .deb file, change chmod/chown of chrome-sandbox
SOURCE_DIR="~/joplin/appimg/joplin"
DIST_DIR="~/joplin/appimg/joplin/dist"
DEB_EDIT_DIR="$SOURCE_DIR/dist/edit"
DEB_TMP_DIR="$DEB_EDIT_DIR/tmp"
REL_VER=$(wget -qO - "https://api.github.com/repos/laurent22/joplin/releases/latest" | grep -Po '"tag_name": ?"v\K.*?(?=")')
DEV_DIR="~/github/joplin-kali/.dev_files"
cd $SOURCE_DIR
sudo chown root:root $SOURCE_DIR/chrome-sandbox && sudo chmod 4755 $SOURCE_DIR/chrome-sandbox
echo $REL_VER > $SOURCE_DIR/VERSION
cp $DEV_DIR/dynamic/package.json $SOURCE_DIR
#package.json edits
yarn electron-builder build --linux deb --prepackaged $SOURCE_DIR --project $SOURCE_DIR
echo "Build complete. changing properties."
mkdir -p $DEB_TMP_DIR
cp $DIST_DIR/joplin*.deb $DEB_EDIT_DIR
cd $DEB_EDIT_DIR
sudo dpkg-deb -R joplin*.deb $DEB_TMP_DIR
cd $DEB_TMP_DIR/DEBIAN
