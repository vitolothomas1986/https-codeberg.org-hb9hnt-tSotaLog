import { Injectable } from '@angular/core';
import { openDB, IDBPDatabase, DBSchema } from 'idb';
import { GlobalSettings } from './globalsettings';
// Required temporarily for the data migration
// Remove eventually.
import { StorageService } from './storage.service';
import { Station } from '../types';

interface StationsDB extends DBSchema {
  stations: {
    key: string,
    value: Station,
    indexes: {name: string}
  }
}

@Injectable({
  providedIn: 'root'
})
export class StationsService {

  ready: Promise<void>;
  db: IDBPDatabase<StationsDB>;

  constructor(
    private globalSettings: GlobalSettings,
    private storageService: StorageService,
  ) {
    // Save the database initializing promise
    // so we can check whether the service is
    // ready.
    this.ready = this.initDb();
  }

  private async initDb(): Promise<void> {
    if (this.db) {
      this.db.close();
    }
    const db = await openDB<StationsDB>('Stations', 1, {
      // For now we have to use arrow functions here to be able to
      // migrate the data from `this`
      upgrade(database, oldVersion, newVersion, transaction, event) {
        const store = database.createObjectStore('stations', {keyPath: 'callsign'});
        store.createIndex('name', 'name');
      },
    });
    this.db = db
    this.migrateOldData();
  }

  /**
   * Migrates data from the old storage. Can be removed in a few
   * versions
   */
  async migrateOldData() {
    await this.ready;
    const oldData = await this.storageService.getStationData();
    if (oldData.length > 0) {
      const promises = []
      for (const station of oldData) {
        promises.push(this.add(station as Station, true));
      }
      await Promise.all(promises);
      await this.storageService.clearStationData();
    }
  }

  /**
   * Searchs for stations using the callsignPart. It only searches
   * at the beginning of the callsign because it uses IDBKeyRanges
   * as search mechanism.
   */
  async search(callsignPart: string): Promise<Station[]> {
    await this.ready;

    const maxResults = this.globalSettings.callListMax;
    const result = []
    const startingPoint = IDBKeyRange.lowerBound(callsignPart);
    const transaction = this.db.transaction('stations', 'readonly');
    const store = transaction.objectStore('stations');
    let cursor = await store.openCursor(startingPoint);
    let keepGoing = true;

    while (keepGoing && cursor) {
      const key = await cursor.key
      if (key.startsWith(callsignPart) && result.length < maxResults) {
        result.push(cursor.value);
        cursor = await cursor.continue();
      } else {
        // Stop looking for results
        keepGoing = false;
      }
    }
    return result;
  }

  /**
   * Use this to obtain the entry of a single station.
   */
  async getStation(callsign: string): Promise<Station> {
    await this.ready;

    const store = this.db.transaction('stations').objectStore('stations');
    return store.get(callsign);
  }

  /**
   * Returns the whole database.
   * Use with care and mainly for exporting
   *
   * @returns Promise<Station[]> full database content;
   */
  async getAllStations(): Promise<Station[]> {
    return this.db.getAll('stations');
  }


  /**
   * Adds a station if it does not exist yet. Leaves existing
   * entries alone and will reject
   *
   * @return Promise<boolean> true if a new entry was created
   *    and false if it was either not created or replaced,
   *    depending on the value of `replace`
   *
   */
  async add(station: Station, replace=false): Promise<boolean> {
    await this.ready;
    let result = false;
    const transaction = this.db.transaction('stations', 'readwrite');
    const store = transaction.objectStore('stations');
    const value = await store.get(station.callsign);
    if ( !value ) {
      // Value does not exist.
      await store.put(station);
      result = true;
    } else if (value.name !== station.name && replace ) {
      // Value will be replaced.
      await store.put(station);
    }
    await transaction.done;
    return result;
  }

  /**
   * Delete an entry from the database
   */
  async delete(callsign: string): Promise<void> {
    await this.ready;

    const transaction = this.db.transaction('stations', 'readwrite');
    const store = transaction.objectStore('stations');
    await store.delete(callsign);
    return transaction.done;
  }

  /**
   * Update the database using a CSV. Entries will be created or replaced.
   * No entries are deleted.
   */
  async updateWithCSV(calls: [string, string][]): Promise<void> {
    await this.ready;

    const promises = []
    const tx = this.db.transaction('stations', 'readwrite');
    const store = tx.objectStore('stations');

    calls.forEach(([callsign, name]) => {
      const addPromise = store.put({callsign, name});
      promises.push(addPromise);
    });
    await Promise.all(promises);
    return tx.done;
  }
}
