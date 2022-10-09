import { Component, OnInit } from '@angular/core';
import { Chooser } from '@awesome-cordova-plugins/chooser/ngx';
import { PopoverController } from '@ionic/angular';
import { EditCallComponent } from './edit-call/edit-call.component';
import { ToastController } from '@ionic/angular';
import { StorageService } from '../storage.service';
import { File } from '@awesome-cordova-plugins/file/ngx';
import * as papa from 'papaparse';

@Component({
  selector: 'app-callsigns',
  templateUrl: './callsigns.page.html',
  styleUrls: ['./callsigns.page.scss'],
})

export class CallsignsPage implements OnInit {
  storage: StorageService;
  callsigns: {[key: string]: string}[];

  constructor(
    public popoverController: PopoverController,
    public toastController: ToastController,
    private storageService: StorageService,
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
    this.ionViewWillEnter();
  }

  async ionViewWillEnter() {
    const callsigns = await this.storage.callsigns;
    callsigns.sort((callA, callB) => { 
      // Since the keys are unique we don't have to check
      // for equality. Returning 0 is not an option.
      if (callA.call > callB.call) {
        return 1;
      }
      else {
        return -1;
      }
    });
    this.callsigns = callsigns;
  }

  delete(callsign: {[key: string]: string}): void {
    this.storage.deleteFromCache(callsign.call);
    const index = this.callsigns.indexOf(callsign, 0);
    if (index > -1) {
         this.callsigns.splice(index, 1);
    }
  }

  async newCall() {
    const callsign = {
      call: '',
      comment: '',
    }
    await this.editCall(callsign);
  }

  async uploadList() {
    const file = await this.chooser.getFile(); 
    const data = new TextDecoder().decode(file.data);
    if (file) {
      const parsedCsvData = papa.parse(data).data;
      return this.storage.replaceCache(parsedCsvData as [string, string][]);
    }
  }

  async downloadList() {
    return
  }

  async editCall(callToEdit: {[key: string]: string}, event?) {
    const callsign = Object.assign({}, callToEdit);
    const editDialog = await this.popoverController.create({
      component: EditCallComponent,
      componentProps: {callsign},
      translucent: true
    });

    editDialog.onDidDismiss().then(async data => {
      if (data.data) { // flag is set by save button on popover
        this.storage.saveInCache(callsign.call, callsign.comment);
        Object.assign(callToEdit, callsign);
        // event is undefined if we created a new entry. We only have to
        // check whether it already exists if we create a new entry
        if (!event && this.callsigns.indexOf(callsign) < 0) {
          const exists = await this.storage.existsInCache(callsign.call);
          if (exists) {
            const call = this.callsigns.find(c => c.call === callsign.call);
            call.comment = callsign.comment;
            this.message(`${callsign.call} already exists, entry was replaced.`);
          } else {
            this.callsigns.push(callsign);
          }
        }
      }
    });

    if (event) {
      // Without an event the edit was not triggered by the edit button
      await editDialog.present();
      return event.target.parentNode.parentNode.close()
    } else {
      return  await editDialog.present();
    }

    // Close the edit button slider

  }
}
