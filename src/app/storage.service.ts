import { Injectable } from '@angular/core';
import { Drivers } from '@ionic/storage';
import { Storage } from '@ionic/storage-angular';
import { GlobalSettings } from './globalsettings';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private _storage: Storage | null = null;
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
  }

  public set(key: string, value: any) {
    this._storage?.set(key, value);
  }

  public async get(key: string) {
    await this.ready;
    const value = await this._storage?.get(key);
    return value;
  }
}
