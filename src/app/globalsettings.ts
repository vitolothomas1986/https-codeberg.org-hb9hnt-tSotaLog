import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { Qso } from '../types';


@Injectable()
export class GlobalSettings {

  darkmode: boolean;
  settingsStorage: StorageService;
  ready: Promise<void>;

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

  constructor(private storage: StorageService) {
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
    this.recentQsos = [];

    this.settingsStorage = storage;
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

  // This function predates the storage service and should
  // eventually be integrated in the storage service....
  async saveToStorage(key: string, value: any) {
    try {
      this.settingsStorage.set(key, value);
    } catch (error) {
      console.log(error);
    }
  }

}
