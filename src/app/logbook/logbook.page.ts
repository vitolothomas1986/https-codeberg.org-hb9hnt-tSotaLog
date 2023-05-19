import { GlobalSettings } from './../globalsettings';
import { Component } from '@angular/core';
import { ModalController} from '@ionic/angular';
import { SpotsModalPage } from './spots-modal/spots-modal.page';
import { IonRouterOutlet } from '@ionic/angular';
import { StatusBar } from '@awesome-cordova-plugins/status-bar/ngx';
import { PopoverController } from '@ionic/angular';
import { EditPopoverComponent } from '../edit-popover/edit-popover.component';
import { ToastController } from '@ionic/angular';
import { Qso } from '../../types'
import { StorageService } from '../storage.service';
import { StationsService } from '../stations.service';


@Component({
  selector: 'app-logbook',
  templateUrl: 'logbook.page.html',
  styleUrls: ['logbook.page.scss']
})

export class LogbookPage {

  darkmode: boolean;
  logType: string;
  settings: GlobalSettings;
  ready: Promise<void>;
  storage: StorageService;
  form: Qso;

  constructor(
    public popoverController: PopoverController,
    public toastController: ToastController,
    public modalController: ModalController,
    private globalSettings: GlobalSettings,
    private statusBar: StatusBar,
    private routerOutlet: IonRouterOutlet,
    private stationsService: StationsService,
    private storageService: StorageService) {

    this.storage = storageService;

    // Possible types are:
    // Activator, Summit2Summit, Chaser
    // TODO: Don't hardcode the log types
    this.logType = 'Activator';
    this.settings = globalSettings;
    this.form = {
      band: '',
      mode: '',
      activatorSummit: '',
      chaserSummit: '',
      time: undefined,
      date: undefined,
      callsign: '',
      rstTx: '',
      rstRx: '',
      comment: '',
    }

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

  async showSpotsModal() {
    const modal = await this.modalController.create({
      component: SpotsModalPage,
      canDismiss: true,
      presentingElement: this.routerOutlet.nativeEl
    });

    await modal.present();

    const result = await modal.onWillDismiss()
    const spot = result?.data
    if (spot) {
      if (this.logType === 'Activator') {
        // if we're chasing we'll assume that the
        // copied log is intended to be a chaser
        // log. So only change to Summit2Summit
        // if we're activating
        this.logType = 'Summit2Summit';
      }
      // Copy spot into the form fields
      Object.assign(this.form, {
        band: spot.frequency,
        mode: spot.mode?.toUpperCase(),
        chaserSummit: `${spot.associationCode}/${spot.summitCode}`,
        callsign: spot.activatorCallsign,
      });

      // Check whether we know the call and fill in the name
      // in the comment field
      await this.callCheck();
    }
  }

  async callCheck() {
    // Get cache if there is any. Otherwise this will return
    // an empty string
    const station = await this.stationsService.getStation(this.form.callsign?.toUpperCase());
    const name = station?.name;
    if (name) {
      this.form.comment = name;
    }
  }

  async logQso() {
    // Some fields of the QSO form might be numbers
    // however the Qso type needs all strings. If we
    // don't do this, typescript won't complain but
    // the resulting JS code still keeps some fields as
    // numbers which then is a problem if we call
    // field.length in the ADIF export
    await Object.keys(this.form).forEach(key => {
      if (this.form[key]?.toString) {
        this.form[key] = this.form[key].toString();
      }
    })

    const newQso:Qso = {
      ...this.form
    }

    // Capitalize because up to here it's only displayed in
    // upper case using css
    newQso.callsign = newQso.callsign.toUpperCase();

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
        callsign: newQso.callsign,
        name: newQso.comment
      }, true);
    }

    this.resetForm();
 }

  resetForm() {
    // clear inputs
    this.form.time = undefined;
    this.form.date = undefined;
    this.form.callsign = '';
    this.form.rstTx = '';
    this.form.rstRx = '';
    this.form.comment = '';
    this.form.chaserSummit = '';
  }

  changeType() {
    // If we change the type we have to reset
    // some summit fields that are not displayed
    switch (this.logType) {
      case 'Activator':
        // If we switch back from s2s to activator log
        // the activator summit might already be filled in.
        // In this case we leave it alone
        if (!this.form.activatorSummit) {
          this.form.activatorSummit = this.form.chaserSummit;
          this.form.chaserSummit = '';
        }
        break;
      case 'Chaser':
        this.form.chaserSummit = this.form.activatorSummit;
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
