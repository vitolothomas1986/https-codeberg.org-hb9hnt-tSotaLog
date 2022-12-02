export type Qso = {
    band: string,
    mode: string,
    activatorSummit: string,
    chaserSummit: string,
    time: string,
    date: string,
    call: string,
    rstTx: string,
    rstRx: string,
    comment: string
};

export type QsoHistory = {
  name: string;
  timeSaved: string;
  qsoList: Array<Qso>;
}

/**
 * Defines the type used to save stations in the database
 * This is exported because we need to be able to use it
 * outside this service to interact with the db.
 */
export type Station = {
  callsign: string,
  name: string,
}


