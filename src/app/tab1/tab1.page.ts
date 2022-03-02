import { GlobalSettings } from './../globalsettings';
import { Component } from '@angular/core';
import { Storage } from '@ionic/storage';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { PopoverController } from '@ionic/angular';
import { EditPopoverComponent } from '../edit-popover/edit-popover.component';
import { ToastController } from '@ionic/angular';


@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})

export class Tab1Page {

  darkmode: boolean;
  settings: GlobalSettings;

  constructor(private storage: Storage, private globalSettings: GlobalSettings,
              private statusBar: StatusBar, public popoverController: PopoverController, public toastController: ToastController) {

    this.storage.get('qsos').then((value) => {

      if ((value != null) && (value !== undefined)) {

        this.settings.recentQsos = value;

      } else {

        this.settings.recentQsos = [];
      }

    }).catch((error) => {
      console.log(error);
      this.settings.recentQsos = [];
    });

    this.settings = globalSettings;
    this.settings.ready.then(() => {

      if (this.settings.darkmode === true) {
        document.body.classList.add('dark');
        this.statusBar.backgroundColorByHexString('#121212');
        this.statusBar.styleBlackOpaque();

      } else {
        this.statusBar.backgroundColorByName('white');
        this.statusBar.styleDefault();
      }

    });

  }

  form = {
    band: '',
    mode: '',
    summit: '',
    time: undefined,
    date: undefined,
    call: '',
    rstGiven: '',
    rstReceived: '',
    comment: '',
    s2s: false,
    s2sSummit: ''
  };

  // Allow user to enter summit reference without the slash and the dash
  // all lowercase
  summitCheck(event) {
    const regex = /([A-Za-z]{2})\/?([A-Za-z]{2})-?([0-9]{3})/;
    const newString = event.target.value.replace(regex, "$1/$2-$3").toUpperCase();
    event.target.value = newString;

  }

  callCheck(event) {
    this.form.call = event.target.value.toUpperCase();
  }

  logQso() {
    const newQso = Object.assign({}, this.form); // copy content of object, don't link object itself!
    
    const now = new Date();
    if (newQso.time == undefined) {
      const timeToStringOpts = {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'UTC',
        hour12: false
      };

      newQso.time = now.toLocaleTimeString([], timeToStringOpts);
    }

    if (newQso.date == undefined) {
      newQso.date = now.toISOString().split("T")[0];
    }
 
    this.settings.recentQsos.unshift(newQso);

    this.storage.set('qsos', this.settings.recentQsos);

    this.resetForm();
 }

  resetForm() {
    // clear inputs
    this.form.time = undefined;
    this.form.date = undefined;
    this.form.call = '';
    this.form.rstGiven = '';
    this.form.rstReceived = '';
    this.form.comment = '';
    this.form.s2s = false;
    this.form.s2sSummit = '';
  }

  async deleteQso(index: number) {

    const deletedQso = this.settings.recentQsos.splice(index, 1);
    this.storage.set('qsos', this.settings.recentQsos);

    const toast = await this.toastController.create({
      message: 'QSO deleted',
      buttons: [
        {
          side: 'end',
          icon: 'arrow-undo',
          text: 'Undo',
          handler: () => {
            this.settings.recentQsos.splice(index, 0, deletedQso[0]);
            this.storage.set('qsos', this.settings.recentQsos);
          }
        }
      ],
      duration: 2000
    });

    toast.present();
  }

  async showEditDialog(qsoNumber: number) {

    const editedQso = Object.assign({}, this.settings.recentQsos[qsoNumber]) ;

    const popover = await this.popoverController.create({
      component: EditPopoverComponent,
      componentProps: {editedQso},
      translucent: true
    });


    popover.onDidDismiss().then(data => {
      if (data.data) { // flag is set by save button on popover
        Object.assign(this.settings.recentQsos[qsoNumber], editedQso);
        this.storage.set('qsos', this.settings.recentQsos);
      }
    });

    return await popover.present();

  }

}
