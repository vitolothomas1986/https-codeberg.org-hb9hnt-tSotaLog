# Roadmap for future versions

The following road map is mainly a list of thing I had planned at some point and 
hat to write down somewhere that I don't forget them (i.e. here).

* Provide a call sign completion for known call signs. i.e. if you type 'hnt' 
  tSotaLog should suggest HB9HNT if you already made contact in an earlier QSO.

* Add a summit database to display summit names

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
