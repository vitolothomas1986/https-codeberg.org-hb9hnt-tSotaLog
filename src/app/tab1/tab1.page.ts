import { GlobalSettings } from './../globalsettings';
import { Component } from '@angular/core';
import { Storage } from '@ionic/storage';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { PopoverController } from '@ionic/angular';
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

  get editing() {
    if (this.form.date || this.form.time) {
      return true;
    }
    return false;
  }

  logQso() {
    const now = new Date();
    const newQso = Object.assign({}, this.form); // copy content of object, don't link object itself!
    
    // If time and date are not defined we're editing
    // a new QSO
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

  async editQso(qsoNumber: number) {
    const editedQso = Object.assign({}, this.settings.recentQsos[qsoNumber]) ;
    this.form = editedQso;
  }
}
