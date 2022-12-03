import { Injectable } from '@angular/core';
import { Drivers } from '@ionic/storage';
import { Storage } from '@ionic/storage-angular';
import { getMainCall } from '../helpers';
import { GlobalSettings } from './globalsettings';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private _storage: Storage | null = null;
  private _callsignCache: Storage | null = null;
  ready: Promise<void>

  constructor(
    private storage: Storage,
    private globalSettings: GlobalSettings
  ) {
    this.ready = this.init();
  }

  async init() {
    const storage = await this.storage.create();
    this._storage = storage;

    this._callsignCache = new Storage({
      name: '_callsign_db',
      storeName: '_callsigns',
      driverOrder: [Drivers.IndexedDB, Drivers.LocalStorage]
    });

    await this._callsignCache.create();
  }

  public set(key: string, value: any) {
    this._storage?.set(key, value);
  }

  public async get(key: string) {
    await this.ready;
    const value = await this._storage?.get(key);
    return value;
  }

  //
  // Only call sign handling methods still
  // required for data migration
  //
  async getStationData(): Promise<{callsign: string, name: string}[]> {
    await this.ready;
    const data = [];
    const keys = await this._callsignCache.keys();
    for (const key of keys) {
      const value = await this._callsignCache.get(key);
      data.push({
        callsign: key,
        name: value
      });
    }
    return data;
  }

  async clearStationData() {
    await this.ready;
    await this._callsignCache.clear()
  }
}
