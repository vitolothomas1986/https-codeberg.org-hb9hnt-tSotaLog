# tSotaLog 
tSotaLog is a simple FLOSS Ham Radio app specifically desgined to SOTA (Summit on the Air)
QSOs. It is a fork from the more general TOTALOG which is designed to log for small contests 
and portable operation. (See impressum)

## Features

* Loggins SOTA QSO's
* Editing QSOs (useful in a pile-up)
* Exporting a CSV to import in SotaData

The following design guidelines were implemented on purpose:

* The app does not validate the data and lets you save whatever you enter.
  This is useful if you want to get as much data into the app in a pile-up without bothering
  whether the format is corret. It gives you the option to clean up later. (But could also result 
  in an invalid CSV-export for SOTA-data. It your responsability to enter sensible data)

## Missing features

The followin features might or might not be added to
the app eventually:

* Auto-completion of summit references
* Validation ot fhe data before exporting

## File export

If you load the QSOs into the archive (middle tab), you can export them as CSV suitable
to import to Sotadata under

https://www.sotadata.org.uk/en/upload/activator/csv

The file will either be saved in a path calles `tSotaData` in your device root or if 
the app does not have the permission to write to this location under

```
Android/data/ch.hb9hnt.tsotalog/files
```

If it is latter try to change the storage permissions for the app in the Android settings.

### Can I create a chaser log?

You will but you have to wait for release 0.2.0

## Developing and Debugging

### Setting everything up on Linux

You need the following installed:

* OpenJDK development package from your distro
* gradle
* npm
* Android tools including platform-tools. Android Studio should be ok, too.



```bash
# Default location of Android Studio's SDK
export ANDROID_SDK_ROOT=~/Android/Sdk
export PATH=$PATH:$ANDROID_SDK_ROOT/tools:$ANDROID_SDK_ROOT/platform-tools

sudo npm i -g @ionic/cli -g cordova -g native-run -g cordova-res
npm install
ionic cordova resources
# Debug in browser without Cordova functionality
ionic serve --livereload

# Run in emulator or on a phone connected via ADB
ionic cordova run android

# Build apk
ionic cordova build android
```

Create release APK
```bash
ionic cordova resources --cordova-res
ionic cordova platform add android
ionic cordova resources android --force
ionic cordova build android --prod --release
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore my-release-key.keystore build/outputs/apk/release/app-release-unsigned.apk alias_name
```

## Impressum

This app is a fork of TOTALOG which can be found here:

https://github.com/hallogallo/totalog

or on F-Droid here:

https://f-droid.org/de/packages/de.dm1ri.totalog/

It you are not into SOTA activations this might be the app you are looking for.
