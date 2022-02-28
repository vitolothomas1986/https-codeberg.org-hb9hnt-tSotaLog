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


## Developing and Debuggins

### Setting everything up on Linux

Install the Android SDK for you distribution, then:

```bash
sudo npm i -g @ionic/cli -g cordova -g native-run -g cordova-res
npm install
ionic cordova resources
ionic cordova emulate --livereload
```

## Impressum

This app is a fork of TOTALOG which can be found here:

https://github.com/hallogallo/totalog

or on F-Droid here:

https://f-droid.org/de/packages/de.dm1ri.totalog/

It you are not into SOTA activations this might be the app you are looking for.
