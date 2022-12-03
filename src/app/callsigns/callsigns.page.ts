import { Component, OnInit } from '@angular/core';
import { Chooser } from '@awesome-cordova-plugins/chooser/ngx';
import { PopoverController } from '@ionic/angular';
import { LoadingController } from '@ionic/angular';
import { EditCallComponent } from './edit-call/edit-call.component';
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';
import { ToastController } from '@ionic/angular';
import { StorageService } from '../storage.service';
import { StationsService } from '../stations.service';
import { Station } from '../../types';
import { File } from '@awesome-cordova-plugins/file/ngx';
import * as papa from 'papaparse';

@Component({
  selector: 'app-callsigns',
  templateUrl: './callsigns.page.html',
  styleUrls: ['./callsigns.page.scss'],
})

export class CallsignsPage implements OnInit {
  storage: StorageService;
  stations: Station[];
  search: string;

  constructor(
    public popoverController: PopoverController,
    public loadingController: LoadingController,
    public toastController: ToastController,
    private androidPermissions: AndroidPermissions,
    private storageService: StorageService,
    private stationsService: StationsService,
    private chooser: Chooser,
    private file: File
  ) {
    this.storage = storageService;
    this.search = '';
  }

  private async message(msg) {
    const toast = await this.toastController.create({
      message: msg,
      duration: 5000
    });
    toast.present();
  }

  async ngOnInit() {
    await this.storage.ready;
    await this.stationsService.ready;
    this.ionViewWillEnter();
  }

  async ionViewWillEnter() {
    const stations = await this.stationsService.search('');
    this.stations = stations;
  }

  async delete(station: Station, event?): Promise<void> {
    const index = this.stations.indexOf(station, 0);
    // Close delete slider just in case it is reused
    // again later
    event?.target.parentNode.parentNode.close()

    await this.stationsService.delete(station.callsign);
    if (index > -1) {
      this.stations.splice(index, 1);
      // cdkFor requires the array to not change after its
      // creation. So we have to create a copy
      this.stations = [...this.stations];
    }
  }

  async refresh(): Promise<void> {
    const searchString = this.search.toUpperCase();
    const stations = await this.stationsService.search(searchString);

    this.stations = stations;
  }

  async newCall() {
    const station = {
      callsign: '',
      name: '',
    }
    await this.editStation(station);
  }

  async uploadList() {
    const opening = await this.loadingController.create({
      message: `Opening file...`,
      //message: `Loading ${file.name}`,
    });
    opening.present();
    // This takes waay to long. That's why we already show a loading 
    // controller above
    const file = await this.chooser.getFile('text/csv');
    
    const loading = await this.loadingController.create({
      message: `Loading ${file.name}`,
    });
    loading.onDidDismiss().then(() => {
      this.refresh();
    });

    // Switch out the loading notification with a more 
    // informative one.
    opening.dismiss();
    loading.present();


    const data = new TextDecoder().decode(file.data);
    if (file) {
      const parsedCsvData = papa.parse(data).data;
      await this.stationsService.updateWithCSV(parsedCsvData as [string, string][]);
    }
    return loading.dismiss();
  }

  async downloadList() {
    const date = (new Date()).toISOString().split('T')[0];
    const filename = `${date}_names.csv`;
    const directory = this.file.externalDataDirectory;
    let message = '';
    let data = '';

    // Start loading data - and informing the user about it
    const loading = await this.loadingController.create({
      message: `Saving to ${filename}`,
    });
    loading.present();
    const stations = await this.stationsService.getAllStations();

    for (const station of stations) {
      data += `${station.callsign},"${station.name}"\n`
    }

    this.androidPermissions.requestPermissions(
      [
        this.androidPermissions.PERMISSION.READ_EXTERNAL_STORAGE,
        this.androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE
      ]
    );

    try {
      await this.file.writeFile(directory, filename, data, { replace: true });
      message = `File saved to\n'${directory.replace(/^file:\/\//, '')}${filename}'`;
    } catch {
      message = 'ERROR: Failed to save file!'
    }

    loading.dismiss();
    this.message(message);
  }

  async editStation(stationToEdit: Station, event?) {
    // Create a copy of the station to edit
    const station = Object.assign({}, stationToEdit);
    const editDialog = await this.popoverController.create({
      component: EditCallComponent,
      componentProps: {station},
      translucent: true
    });

    if (event) {
      // If an event exists, the edit was triggered by the edit button
      // and we have to close the slider again.
      event.target.parentNode.parentNode.close()
    }

    await editDialog.present();

    const data = await editDialog.onDidDismiss();
    if (data.data) { // flag is set by save button on popover

      // event is undefined if we created a new entry because the
      // function is not called from the edit button where we pass
      // `$event`.
      // If it is a new entry we don't replace an existing one.
      const newEntry = !event
      try {
        await this.stationsService.add(station, !newEntry);
      } catch(e) {
        this.message(e);
        return
      }

      // Copy data back to the original object
      Object.assign(stationToEdit, station);

      if (newEntry) {
        this.stations = [stationToEdit, ...this.stations];
        this.message(`Entry for ${station.callsign} created.`);
      } else {
        this.message(`Entry for ${station.callsign} updated.`);
      }
    }
  }
}
