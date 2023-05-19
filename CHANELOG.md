# Roadmap for future versions

The following road map is mainly a list of thing I had planned at some point and 
hat to write down somewhere that I don't forget them (i.e. here).

* Provide a call sign completion for known call signs. i.e. if you type 'hnt' 
  tSotaLog should suggest HB9HNT if you already made contact in an earlier QSO.

* Add a summit database to display summit names

# Version 0.5.1 (bugrix release)

* Issue #26: Move the toast to the top such that it doesn't cover the bottom
  bar. More of a workaround because I was to lazy to figure out how to
  reposition it using CSS...

* When entering a station with a prefix, do not search for the call with the 
  prefix in the name database. This way we also find names from people operating
  from abroad

* When exporting, only add `/P` if it is not already present. It might be because
  we copied from a spot.

* Issue #30: Also fill in the name from the database if the callsign is copied
  from a spot.

* Issue #29: Ensure mode is copied from the spot, even the original spot uses
  a lowercase mode.

# Version 0.5.0

* Improved error reporting when importing a names.csv file. This should help
  with debugging csv import errors

* BUGFIX Issue #20: Don't switch to a summit2summit log if we're in chaser mode.

* Issue #14: We now use the Cordova save dialog plugin to allow the user to choose
  where to save the exported files. This applies to the names.csv and the log csv 
  and adif files.

# Version 0.4.1 (bugfix release)

* Issue #13: Fix fetching of spots. Because our value of -0.5 was not supported by
  the API, only one spot showed up in the list.

* Issue #12: ADIF export contained fields that had a specified length of `undefined`
  because some values of the QSO were JS numbers (even Typescript believed them to
  be strings).

# Version 0.4.0

* Issue #3: Added ADIF export support. The export dialog now asks for the format to export
  and either writes a `.adif` or a `.csv` file. Both formats can also be exported
  to the clipboard in case saving to files directly does not work. (Thanks to
  Joe OE5JFE for providing 
  [an ADIF example on the Sota reflector.](https://reflector.sota.org.uk/t/tsotalog-fork-of-general-purpose-foss-logging-app-totalog/28500/10)

* Issue #10: Access the latest SOTA spots from the log entry form to copy the data from 
  the spot to the entry form. This makes logging s2s QSOs easier when s2s chasing.
  (Please note, this doesn't mean the app supports sending spots. Receiving them 
  is easier because we don't have to deal with authentication on the API.)

# Version 0.3.0

* BUGFIX Do not clear summit field when switching from activator to chaser log
  and back. (Note however that switching from CHA to S2S moves the summit down
  to the summit of the other station since this makes sense if you convert a 
  chase to a S2S on the way because you reach the activation zone)

* Add a counter to the recent QSO list on the first tab. This helps helps
  with estimating how well the current activation went so far. It also lists
  chaser, activator and s2s counts in case you have some chaser logs left from
  way to the summit (every s2s also counts as chaser and activator log)

* Add new tab to show stored names for callsigns. This change involves
  * Allowing to import a names.csv file consisting of a column of callsigns 
    and a column of names. (no header row required or supported)
  * Support for names.csv export to a file.
  * The user can edit or delete statins by swiping left or right.
  * A station can be added manually without recording a QSO.
  * The list of callsigns is currently limited to 100 at a time. Use the 
    provided filter field to search for a station.
  * The callsign store was implemented using indexeddb. Due to a lack of 
    support for string matching in the way SQL does with `LIKE` only 
    filtering for the first part of a callsign is supported.

* BUGFIX Fix regex to also match regions that consist of somthing else than two 
  characters. Now ea3bc002 also completed to EA3/BC-002.

* Upgrade Angular to version 14

* Upgrade Ionic to version 6

# Version 0.2.0

* The option to add a `/P` to the callsign now adds the `/P` to every operator
  that is standing on a summit, depending on whether it's a chaser, activator
  or s2s log.

* Change the layout to the mode selection so that you don't have to click ok to 
  select a mode.

* Add a callsign/name cache: tSotaLog will remember the comment you added along
  with a certain call sign and if you type the callsign again it will auto-complete
  the Name/Comment field. That's also why the field was renamed to 'Name/Comment'. 
  This way you'll be able to address known contacts by name.

* Provide a way to log as a chaser. (Limitation: At this point 
  it won't add a `/P` or a `/M` to you call on a chaser log if requred.)

* Fixed Issue #1: Cursor won't jump to the end of the callsign input when entering
  lowercase letters at another position.

* Updates several npm packages to newer version.

* Bumped Android target and minimum SDK versions to work with newer package
  versions.

* Some code reogranisation

* Fixed some minor layout issues

# Version 0.1.0

First version atfter forking from tSotaLog
