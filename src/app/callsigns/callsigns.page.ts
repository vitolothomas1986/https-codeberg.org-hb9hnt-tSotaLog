import { Component, OnInit } from '@angular/core';
import { Chooser } from '@awesome-cordova-plugins/chooser/ngx';
import { PopoverController } from '@ionic/angular';
import { EditCallComponent } from './edit-call/edit-call.component';
import { ToastController } from '@ionic/angular';
import { StorageService } from '../storage.service';
import { StationsService, Station } from '../stations.service';
import { File } from '@awesome-cordova-plugins/file/ngx';
import * as papa from 'papaparse';

@Component({
  selector: 'app-callsigns',
  templateUrl: './callsigns.page.html',
  styleUrls: ['./callsigns.page.scss'],
})

export class CallsignsPage implements OnInit {
  storage: StorageService;
  //stations: {[key: string]: string}[];
  stations: Station[];

  constructor(
    public popoverController: PopoverController,
    public toastController: ToastController,
    private storageService: StorageService,
    private stationsService: StationsService,
    private chooser: Chooser,
    private file: File
  ) {
    this.storage = storageService;
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

  async delete(station: Station): Promise<void> {
    const index = this.stations.indexOf(station, 0);
    await this.stationsService.delete(station.callsign);
    if (index > -1) {
      this.stations.splice(index, 1);
      // cdkFor requires the array to not change after its
      // creation. So we have to create a copy
      this.stations = [...this.stations];
    }
  }

  async updateSearch(event): Promise<void> {
    const searchString = event.target.value;
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
    const file = await this.chooser.getFile();
    const data = new TextDecoder().decode(file.data);
    if (file) {
      const parsedCsvData = papa.parse(data).data;
      return this.stationsService.updateWithCSV(parsedCsvData as [string, string][]);
    }
  }

  async downloadList() {
    return
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

    const data = await editDialog.onDidDismiss()
    if (data.data) { // flag is set by save button on popover
      const createdNew = await this.stationsService.addOrUpdate(station);

      // Copy data back to the original object
      Object.assign(stationToEdit, station);

      // event is undefined if we created a new entry. We only have to
      // check whether it already exists if we create a new entry
      if (!event && this.stations.indexOf(stationToEdit) < 0) {
        this.stations = [stationToEdit, ...this.stations];
        this.message(`${station.callsign} already exists, entry was updated.`);
      }
    }
  }
}
