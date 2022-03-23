import { Injectable } from '@angular/core';
import { Drivers } from '@ionic/storage';
import { Storage } from '@ionic/storage-angular';
import { getMainCall } from '../helpers';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private _storage: Storage | null = null;
  private _callsignCache: Storage | null = null;
  ready: Promise<void>

  constructor(private storage: Storage) {
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
  // Call sign cache handling
  //
  saveInCache(call: string, name: string) {
    const key = getMainCall(call);

    if (name.length > 0) {
      this._callsignCache?.set(key, name);
    }
  }

  async getFromCache(call: string): Promise<string> {
    const key = getMainCall(call);

    try {
      const value = await this._callsignCache?.get(key);
      return value ? value : '';
    } catch {
      return '';
    }
  }

}
