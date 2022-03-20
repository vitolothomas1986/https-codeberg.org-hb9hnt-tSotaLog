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
