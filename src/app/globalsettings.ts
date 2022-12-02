import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { Qso } from '../types';


@Injectable()
export class GlobalSettings {

  darkmode: boolean;
  storage: StorageService;
  ready: Promise<void>;
  callListMax: number; 

  opData: {
    callsign: string,
    name: string,
  };

  exportSettings: {
    rstComment: boolean,
    s2sComment: boolean,
    addPortable: boolean
  };

  recentQsos: Array<Qso>;

  modes: Array<string>;

  constructor(private storageService: StorageService) {
    this.opData = {
      callsign: '',
      name: ''
    };

    this.exportSettings = {
      rstComment: true,
      s2sComment: true,
      addPortable: true
    };

    this.modes = ['FM', 'SSB', 'CW', 'DATA', 'AM', 'Other'];
    this.callListMax = 100;
    this.recentQsos = [];

    this.storage = storageService;
    this.ready = this.initialize();
  }

  async initialize() {

    try {
      const result = await this.storage.get('darkmode');
      if ((result != null) && (result !== undefined)) {

        this.darkmode = result;

      } else {

        this.darkmode = false;
      }

    } catch (error) {
      console.log(error);
    }

    try {
      const result = await this.storage.get('op-data');
      if ((result != null) && (result !== undefined)) {
        this.opData = result;
      }
    } catch (error) {
      console.log(error);
    }

    try {
      const result = await this.storage.get('export-settings');
      if ((result != null) && (result !== undefined)) {
        this.exportSettings = result;
      }
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * Gives some stats about how many QSOs there are
   * in the recent QSOs, separated by Chaser, Activator and
   * s2s logs
   */
  get recentQsoStats() {
    let total, act, cha, s2s;
    total = act = cha = s2s = 0;
    for (const qso of this.recentQsos) {
      if (qso.activatorSummit !== '') {
        act++;
      }
      if (qso.chaserSummit !== '') {
        cha++;
      }
      if (qso.chaserSummit !== '' && qso.activatorSummit !== '') {
        s2s++;
      }
      total++;
    }

    return {total, act, cha, s2s}
  }
  // This function predates the storage service and should
  // eventually be integrated in the storage service....
  async saveToStorage(key: string, value: any) {
    try {
      this.storage.set(key, value);
    } catch (error) {
      console.log(error);
    }
  }

}
