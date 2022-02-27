import { waitForAsync } from '@angular/core/testing';
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';


@Injectable()
export class GlobalSettings {

  darkmode: boolean;
  settingsStorage: Storage;
  ready: any;

  opData: {
    callsign: string,
    name: string,
  };

  exportSettings: {
    rstComment: boolean,
    s2sComment: boolean
  };

  recentQsos: Array<any>;

  constructor(private storage: Storage) {

    this.opData = {
      callsign: '',
      name: ''
    };

    this.exportSettings = {
      rstComment: true,
      s2sComment: true
    };

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

  async saveToStorage(key: string, value: any) {
    try {
      this.settingsStorage.set(key, value);
    } catch (error) {
      console.log(error);
    }
  }

}
