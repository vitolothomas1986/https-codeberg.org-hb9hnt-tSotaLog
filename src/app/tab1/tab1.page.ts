import { GlobalSettings } from './../globalsettings';
import { Component } from '@angular/core';
import { StatusBar } from '@awesome-cordova-plugins/status-bar/ngx';
import { PopoverController } from '@ionic/angular';
import { EditPopoverComponent } from '../edit-popover/edit-popover.component';
import { ToastController } from '@ionic/angular';
import { Qso } from '../../types'
import { StorageService } from '../storage.service';
import { StationsService } from '../stations.service';


@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})

export class Tab1Page {

  darkmode: boolean;
  logType: string;
  settings: GlobalSettings;
  ready: Promise<void>;
  storage: StorageService;

  form = {
    band: '',
    mode: '',
    activatorSummit: '',
    chaserSummit: '',
    time: undefined,
    date: undefined,
    call: '',
    rstTx: '',
    rstRx: '',
    comment: '',
  };

  constructor(
    private globalSettings: GlobalSettings,
    private statusBar: StatusBar,
    public popoverController: PopoverController,
    public toastController: ToastController,
    private stationsService: StationsService,
    private storageService: StorageService) {

    this.storage = storageService;

    // Possible types are:
    // Activator, Summit2Summit, Chaser
    // TODO: Don't hardcode the log types
    this.logType = 'Activator';
    this.settings = globalSettings;

    this.ready = this.init();
  }

  async init() {

    try {
      const qsos = await this.storage.get('qsos')
      if ((qsos != null) && (qsos !== undefined)) {
        this.settings.recentQsos = qsos;
      } else {
        this.settings.recentQsos = [];
      }
    } catch (error) {
      console.log(error);
      this.settings.recentQsos = [];
    }

    await this.settings.ready

    if (this.settings.darkmode === true) {
      document.body.classList.add('dark');
      this.statusBar.backgroundColorByHexString('#121212');
      this.statusBar.styleBlackOpaque();

    } else {
      this.statusBar.backgroundColorByName('white');
      this.statusBar.styleDefault();
    }
  }

  get showS2sField() {
    return this.logType === 'Summit2Summit';
  }

  // Allow user to enter summit reference without the slash and the dash
  // all lowercase
  summitCheck(event) {
    const regex = /^([A-Za-z0-9]{1,3})\/?([A-Za-z]{2})-?([0-9]{3}$)$/;
    const newString = event.target.value.replace(regex, '$1/$2-$3').toUpperCase();
    event.target.value = newString;

  }

  async callCheck() {
    // Get cache if there is any. Otherwise this will return
    // an empty string
    const station = await this.stationsService.getStation(this.form.call);
    const name = station?.name;
    if (!this.form.comment.includes(name)) {
      this.form.comment = name;
    }
  }

  logQso() {
    const newQso:Qso = {
      ...this.form
    }

    // Capitalize because up to here it's only displayed in
    // upper case using css
    newQso.call = newQso.call.toUpperCase();

    const now = new Date();
    if (newQso.time === undefined) {
      const timeToStringOpts = {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'UTC',
        hour12: false
      } as const;

      newQso.time = now.toLocaleTimeString([], timeToStringOpts);
    }

    if (newQso.date === undefined) {
      newQso.date = now.toISOString().split('T')[0];
    }

    this.settings.recentQsos.unshift(newQso);

    this.storage.set('qsos', this.settings.recentQsos);

    // If there is a comment, we add the Comment as
    // name to the stations service
    if (newQso.comment.length > 0) {
      this.stationsService.add({
        callsign: newQso.call,
        name: newQso.comment
      }, true);
    }

    this.resetForm();
 }

  resetForm() {
    // clear inputs
    this.form.time = undefined;
    this.form.date = undefined;
    this.form.call = '';
    this.form.rstTx = '';
    this.form.rstRx = '';
    this.form.comment = '';
    this.form.chaserSummit = '';

    // Set back to Activator log
    this.logType = 'Activator';
  }

  changeType() {
    // If we change the type we have to reset
    // some summit fields that are not displayed
    switch (this.logType) {
      case 'Activator':
        this.form.chaserSummit = '';
        break;
      case 'Chaser':
        this.form.activatorSummit = '';
        break;
    }
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
