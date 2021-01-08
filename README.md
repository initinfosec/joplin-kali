# joplin-kali

UNOFFICIAL joplin debian port, specifically for the Kali Linux Repos. - currently built for x64 debian-based distros

03 Mar 2020 - The official dev of joplin has stated they currently will not support anything outside of the official AppImage format, but has given me the go-ahead to start a debian port/build. All credit for the Joplin App goes to [Laurent Cozic](https://github.com/laurent22) and the rest of the team of Joplin contributors and developers.

Caveat emptor: As such, this package is unsupported in this format by the developer. I have done what I can to test the builds I release. If you think there is an issue specific to the .deb build, please let me know. Otherwise, I will support where I can, but make no guarantees. 

Please reference the official [Joplin website](https://joplinapp.org/) and [git repo](https://github.com/laurent22/joplin) for more info about Joplin.

## Brief Changelog

Updated dev branch with new test .deb package for kali based on latest AppImage format. This is currently unsupported and still in dev/WIP. Use at your own risk.

## Installation

Until this package is offocially in kali repos, please install via the following method, being sure to change items in angle brackets:

```
cd <desired_install direcctory>
wget https://github.com/initinfosec/joplin-kali/raw/master/<joplin_deb_file>.deb
sudo apt install ./<joplin_deb_file>.deb
```

## What is Joplin?

Joplin is a free, open source note taking and to-do application, which can handle a large number of notes organised into notebooks. The notes are searchable, can be copied, tagged and modified either from the applications directly or from your own text editor. The notes are in Markdown format.


### Debian Port Rationale

TL;DR - the official package format for Joplin is currently incompatible with Debian-based distros due to the way Debian expects to see permissions on a single file used by electron. The current app package didn't allow for a clean fix, so I have ported the official source to a .deb.



There seems to be an issue currently with Joplin installs in Debian and Kali (a debian-based distro.) The current official install method utilizes a bash script that then downloads and sets executable permissions to the executable, which is curerntly packaged in an AppImage format - this format is essentially a compressed file that is an executable binary. The desktop app is currently an Electron client which makes utilization of a file from the FOSS chrome/chromium project, "chrome-sandbox."

Currently, Debian distrobutions expect the chrome-sandbox file to have a SUID bit set as root, and for the owner to be root. However, this is not the case in the application source, or the AppImage format that the application is packaged into, causing the appication to install, but actually fail to run in current Debian based systems. Other distrobutions do not seems to have this issue, so it seems to be that Debian expects the SUID and chown on the sandbox file as root specifically.

Now, an option to run without the sandbox is presented upon failure to launch, stating you can use the --no-sandbox flag. However, upon trying to use that option, A UI window appears and says: "Unrecognized flag --no-sandbox." Once this is closed, the application does not launch either. Thus, the prompt for the no-sandbox option was likely from the chromium code itself, whereas the current Joplin build does not have that option implemented, or has disallowed that.

So a few options present itself, short of some fixes upstream with either Joplin, Electron or the AppImage format. One of those options would be to enable a global setting within debian that allows for the execution of the chrome sandbox to not run as a privileged user, and the application to still run. However, not implementing this setting currently was an intentional choice by the Debian developers, as it could open a multiplicity of potential security issues, and is at best a very "hammer" approach to a "scalpel" problem. This potential workaround would be editing global settings for user namespaces, and more information about it and the surrounding context of the problem can be [found here](https://github.com/electron/electron/issues/17972).

From experimentation, even when the SUID chmod and chown were set properly to the single file chrome-sandbox, packaging back into the appImage format caused loss of those permissions (expectedly), as the appImage was packaged as a regular user. The SUID was preserved but ownership was a regular user. Similar to tar or wget, you cannot maintain a higher privilege on any files when downloading and setting a chmod, so when trying to execute the re-packaged appImage after making the chmod change results in the same issue.

Thus, if we don't want to change the usernamespace property on the distro, and the packaged AppImage format as is doesn't work (until a change with electron or the AppImage format), we're left with two options. The first, which I verified to work (as part of trying to repackage the AppImage) is to extract the AppImage file, chmod and chown the chrome-sandbox file to the expected permissions (<code>sudo chown root:root chrome-sandbox && sudo chmod 4755 chrome-sandbox</code>) in the extracted folder (squashfs-root), and then point any launcher (e.g. from XCFE) to the joplin executable within extracted folder. While this works, it didn't seem clean or reliable, and defeats the point of the original install mechanism. Plus, any time an update is made through the installer script, you would have to redo the above steps to fix the permissions. 

The final option would be to build from source and repackage the application in a more debian-friendly format, which I have attempted to do. The electron app is compiled from the official Joplin source, and then the resulting app is then packaged into a .deb as root, *after* the aforementioned permissions are fixed with chrome-sandbox. Since the .deb packaging is done as root, and you need to call sudo to run the .deb installer, the permissions for the chrome-sandbox are preserved to the proper expected values, even when run as a regular user. Hence taking this route for a fix. N.B. that while this is the official app from the official source, this particular install method is not yet official from the creator of Joplin. As such, the install script (currently in work) had to be modified, and some further thought will need to be given on how to handle package updates.

I will be in contact with the developer shortly, to see if wew can perhaps include a .deb package upstream, and thus more normal updates.

Again, if you are running a non-Debian based distro, this should be a non-issue and you can/should use the official install.
