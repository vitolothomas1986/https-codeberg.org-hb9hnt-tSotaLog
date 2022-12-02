# Roadmap for future versions

The following road map is mainly a list of thing I had planned at some point and 
hat to write down somewhere that I don't forget them (i.e. here).

* Provide a call sign completion for known call signs. i.e. if you type 'hnt' 
  tSotaLog should suggest HB9HNT if you already made contact in an earlier QSO.

* Add a summit database to display summit names

# Next release

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
