import { Component } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { ModalController} from '@ionic/angular';
import { DatePipe } from '@angular/common';
import { QsoEditModalPage } from './../qso-edit-modal/qso-edit-modal.page';
import { IonRouterOutlet } from '@ionic/angular';
import { Clipboard } from '@awesome-cordova-plugins/clipboard/ngx';
import { Chooser } from '@awesome-cordova-plugins/chooser/ngx';
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';
import { ToastController } from '@ionic/angular';
import { File } from '@awesome-cordova-plugins/file/ngx';
import { GlobalSettings } from './../globalsettings';
import { Qso, QsoHistory } from './../../types'
import { getFilePath, callIsPortable } from './../../helpers'
import { StorageService } from '../storage.service';

declare const cordova;

@Component({
  selector: 'app-history',
  templateUrl: 'history.page.html',
  styleUrls: ['history.page.scss']
})
export class HistoryPage {

  qsoStorage: StorageService;
  qsoHistory: Array<QsoHistory>;
  settings: GlobalSettings;
  recentQsos: Array<Qso>;

  constructor(
    public toastController: ToastController,
    public modalCtrl: ModalController,
    private storage: StorageService,
    private androidPermissions: AndroidPermissions,
    private alertControl: AlertController,
    private routerOutlet: IonRouterOutlet,
    private clipboard: Clipboard,
    private chooser: Chooser,
    private file: File,
    private globalSettings: GlobalSettings) {

    this.qsoStorage = storage;
    this.settings = globalSettings;
    this.file = file;

    this.storage.get('qsoHistory').then((value) => {

      if ((value != null) && (value !== undefined)) {

        this.qsoHistory = value;

      } else {

        this.qsoHistory = [];
      }

    }).catch((error) => {
      console.log(error);
      this.qsoHistory = [];
    });

  }

  template = {
    name: '',
    timeSaved: '',
    qsoList: [],
  };

  async archiveQsoDialog() {
    const archiveName = await this.getArchiveName();
    const alert = await this.alertControl.create({
      header: 'Archive recent QSOs',
      inputs: [
        {
          name: 'name',
          type: 'text',
          value: archiveName,
          placeholder: 'name'
        }, ],
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
          },
          {
            text: 'archive QSOs',
            handler: (alertData) => {
              this.archiveQsos(alertData.name);
            }
          }
        ]
      });

    await alert.present();
  }

  /* Returns an name for the archive of the current qsos.
   *
   *
   * If the activator summit is the same or empty for all QSOs we'll mention the summit.
   * If the date is the same for all QSOs we'll use that date, otherwise we'll use
   * today's date
   *
   */
  public async getArchiveName() {
    try {
      const recentQsos = await this.storage.get('qsos');

      if ((recentQsos == null) || (recentQsos === undefined)) {
        return new Date().toISOString().split('T')[0];
      }

      let date = recentQsos[0].date
      let summit;
      for (const qso of recentQsos) {
        if (!summit && qso.activatorSummit) {
          console.log(`${qso.activatorSummit} ${summit}`)
          summit = qso.activatorSummit;
        }

        if (qso.date !== date) {
          date = new Date().toISOString().split('T')[0];
        }

        if (qso.activatorSummit !== '' && qso.activatorSummit !== summit) {
          summit = '';
        }
      }

      return `${date} ${summit}`;
    } catch (error) {
      console.log(error);
      return new Date().toISOString().split('T')[0];
    }
  }


  async archiveQsos(name: string) {

    try {
      const recentQsos = await this.storage.get('qsos');

      if ((recentQsos == null) || (recentQsos === undefined)) {
        return;
      }

      const newEntry = Object.assign({}, this.template);

      newEntry.qsoList = recentQsos;
      newEntry.name = name;

      // generate timestamp
      const now = new Date();
      newEntry.timeSaved = now.getFullYear().toString() + '-' + (now.getMonth() + 1).toString().padStart(2, '0')
      + '-' + now.getDate().toString().padStart(2, '0');

      // save QSOs to history
      this.qsoHistory.unshift(newEntry);
      this.qsoStorage.set('qsoHistory', this.qsoHistory);

      // clear recent QSOs
      this.settings.recentQsos = [];
      this.storage.set('qsos', []);

      const toast = await this.toastController.create({
        message: 'Moved recent QSOs to archive',
        duration: 2000,
        position: 'top'
      });
      toast.present();

    } catch (error) {
      console.log(error);
    }

  }

  async loadQsos(index: number) {

    try {

      if (this.settings.recentQsos.length > 0) {

      const alert = await this.alertControl.create({
        header: 'Recent QSOs are not empty',
        message: 'Are you sure? This will overwrite your recent QSO list.',
          buttons: [
            {
              text: 'Yes',
              handler: async () => {
                this.copyArchivedQsosToRecents(index);
              }
            },
            {
              text: 'No',
              role: 'cancel'
            }
          ]
        });

      await alert.present();

      } else {
        this.copyArchivedQsosToRecents(index);
      }

    } catch (error) {
      console.log(error);
    }

  }

  async copyArchivedQsosToRecents(index: number) {

      this.settings.recentQsos = Object.assign([], this.qsoHistory[index].qsoList);
      this.storage.set('qsos', this.settings.recentQsos);

      const toast = await this.toastController.create({
        message: 'QSOs loaded!',
        duration: 2000,
        position: 'top'
      });
      toast.present();

  }

  async exportQsos(index: number) {
    const alert = await this.alertControl.create({
      header: 'Export QSOs',
      message: 'make sure you got the OP settings right',
      inputs: [
        {
          label: 'SOTA CSV',
          type: 'radio',
          checked: true,
          value: 'csv',
        },
        {
          label: 'ADIF',
          type: 'radio',
          value: 'adif',
        },
      ],
      buttons: [
       {
          text: 'Copy to clipboard',
          handler: (type) => {
            this.copyToClipboard(index, type);
          }
        },
       {
          text: 'Save to file',
          handler: (type) => {
            this.saveFile(index, type);
          }
        },
        {
          text: 'Cancel',
          role: 'cancel',
        }
      ]
      });

    await alert.present();
  }

  async showQsoEditModal(index: number) {

    const modal = await this.modalCtrl.create({
      component: QsoEditModalPage,
      componentProps: this.qsoHistory[index],
      swipeToClose: true,
      presentingElement: this.routerOutlet.nativeEl
    });

    await modal.present();

    await modal.onWillDismiss().then(async () => {
      await this.storage.set('qsoHistory', this.qsoHistory);
    });

  }

  async deleteQsos(index: number) {

    const alert = await this.alertControl.create({
      header: 'Delete QSO',
      message: 'Are you sure?',
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
          },
          {
            text: 'OK',
            handler: async () => {
              try {
                this.qsoHistory.splice(index, 1);
                await this.storage.set('qsoHistory', this.qsoHistory);
              } catch (error) {
                console.log(error);
              }
            }
          }
        ]});

    await alert.present();

  }

  async copyToClipboard(index: number, type='csv') {
    this.clipboard.copy(this.generateExport(index, type));
    const toast = await this.toastController.create({
      message: 'Your log has been copied!',
      duration: 2000,
      position: 'top'
    });
    toast.present();
  }

  async saveFile(index: number, type='csv') {
    const name = this.qsoHistory[index].name;
    const date = (new Date()).toISOString().split('T')[0];
    const filename = `${name}_${date}.${type}`;
    const data = this.generateExport(index, type);
    const dataBlob = new Blob([data], {type: 'text/plain'});
    let message = '';
    let uri;

    this.androidPermissions.requestPermissions(
      [
        this.androidPermissions.PERMISSION.READ_EXTERNAL_STORAGE,
        this.androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE
      ]
    );

    try {
      uri = await cordova.plugins.saveDialog.saveFile(dataBlob, filename)
      message = `File saved to\n'${getFilePath(uri)}'`;
    } catch (e) {
      message = `ERROR: ${e}`;
    }

    const toast = await this.toastController.create({
      message,
      duration: 5000,
      position: 'top'
    });
    toast.present();
  }

  generateExport(index: number, format='csv'): string {

    const qsosToExport = this.qsoHistory[index].qsoList;
    const includeRst = this.settings.exportSettings.rstComment;
    const includeS2s = this.settings.exportSettings.s2sComment;
    const ownCallsign = this.settings.opData.callsign;
    let lineGenerator;
    let exportData = '';

    // Choose a line generator function.
    if (format === 'csv') {
      lineGenerator = generateCsvLine;
    } else if (format === 'adif') {
      lineGenerator = generateAdifLine;
      const [genDate, genTime] = new Date().toISOString().split('T');
      // Add adif header
      exportData = `Generated on ${genDate} at ${genTime} for ${ownCallsign}\r\n\r\n` +
        '<ADIF_VER:5>3.1.3\r\n' +
        '<PROGRAMMID:7>tSotaLog\r\n\r\n' +
        '<EOH>\r\n\r\n'
    }

    // SotaData expects the CSV to be in chronological order
    // but the QSOs might not be if they were edited later,
    // not entered one after another.
    qsosToExport.sort((qsoA, qsoB) => {
      const timeA = new Date(`${qsoA.date}T${qsoA.time}Z`);
      const timeB = new Date(`${qsoB.date}T${qsoB.time}Z`);
      if (timeA > timeB) { return 1 }
      if (timeA < timeB) { return -1 }
      return 0;
    });

    for (const qso of qsosToExport) {
      let callsignUsed = ownCallsign;
      let otherCallsign = qso.callsign;
      let comment = qso.comment;

      // Add a /P to stations on a summit if the
      // settings say to do so.
      if (this.settings.exportSettings.addPortable) {
        if (
          qso.activatorSummit !== '' &&
          ! callIsPortable(callsignUsed)
        ) {
          callsignUsed += '/P';
        }
        if (
          qso.chaserSummit !== '' &&
          ! callIsPortable(otherCallsign)
        ) {
          otherCallsign += '/P';
        }
      }

      if (includeRst && qso.rstRx) {
        if (comment !== '') {
          comment += ' ';
        }
        comment += `r${qso.rstRx}`;
      }

      if (includeRst && qso.rstTx) {
        if (comment !== '') {
          comment += ' ';
        }
        comment += `s${qso.rstTx}`;
      }

      if (includeS2s && qso.chaserSummit !== '' && qso.activatorSummit !== '') {
        if (comment !== '') {
          comment += ' ';
        }
        comment += `S2S ${qso.chaserSummit}`;
      }

      // Add actual line to export data using the selected
      // line generator. S
      exportData += lineGenerator(
        callsignUsed,
        qso.activatorSummit,
        otherCallsign,
        qso.chaserSummit,
        qso.date,
        qso.time,
        qso.band,
        qso.mode,
        comment,
        qso.rstTx,
        qso.rstRx
      )
    }
    return exportData;
  }
}

function generateCsvLine(
  ownCallsign: string,
  ownSummit: string,
  otherCallsign: string,
  chasedSummit: string,
  date: string,
  time: string,
  freq: string,
  mode: string,
  comment: string,
): string {
  return 'V2,'.concat(
    `${ownCallsign},${ownSummit},`,
    `${date},${time},`,
    `${freq}Mhz,${mode},`,
    `${otherCallsign},`,
    `${chasedSummit},"${comment}"`,
    '\r\n'
  )
}

function generateAdifLine(
  ownCallsign: string,
  ownSummit: string,
  otherCallsign: string,
  chasedSummit: string,
  date: string,
  time: string,
  freq: string,
  mode: string,
  comment: string,
  rstTx: string,
  rstRx: string,
): string {
  const datePipe = new DatePipe('en-US');
  const dateString = datePipe.transform(new Date(date), 'yyyyMMdd');
  const operator = ownCallsign.replace('/P', '');
  let band = ''
  time = time.replace(':', '');

  // Determine band according to ADIF specs
  // http://adif.org.uk/313/ADIF_313.htm#Band_Enumeration
  // This looks terrible but I couldn't find a better way
  const freqNumber = parseFloat(freq);
  if (freqNumber >= .1357 && freqNumber <= .1378) {band = '2190m'}
  else if (freqNumber >= .472 && freqNumber <= .479) {band = '630m'}
  else if (freqNumber >= .501 && freqNumber <= .504) {band = '560m'}
  else if (freqNumber >= 1.8 && freqNumber <= 2.0) {band = '160m'}
  else if (freqNumber >= 3.5 && freqNumber <= 4.0) {band = '80m'}
  else if (freqNumber >= 5.06 && freqNumber <= 5.45) {band = '60m'}
  else if (freqNumber >= 7.0 && freqNumber <= 7.3) {band = '40m'}
  else if (freqNumber >= 10.1 && freqNumber <= 10.15) {band = '30m'}
  else if (freqNumber >= 14.0 && freqNumber <= 14.35) {band = '20m'}
  else if (freqNumber >= 18.068 && freqNumber <= 18.168) {band = '17m'}
  else if (freqNumber >= 21.0 && freqNumber <= 21.45) {band = '15m'}
  else if (freqNumber >= 24.890 && freqNumber <= 24.99) {band = '12m'}
  else if (freqNumber >= 28.0 && freqNumber <= 29.7) {band = '10m'}
  else if (freqNumber >= 40 && freqNumber <= 45) {band = '8m'}
  else if (freqNumber >= 50 && freqNumber <= 54) {band = '6m'}
  else if (freqNumber >= 54.000001 && freqNumber <= 69.9) {band = '5m'}
  else if (freqNumber >= 70 && freqNumber <= 71) {band = '4m'}
  else if (freqNumber >= 144 && freqNumber <= 148) {band = '2m'}
  else if (freqNumber >= 222 && freqNumber <= 225) {band = '1.25m'}
  else if (freqNumber >= 420 && freqNumber <= 450) {band = '70cm'}
  else if (freqNumber >= 902 && freqNumber <= 928) {band = '33cm'}
  else if (freqNumber >= 1240 && freqNumber <= 1300) {band = '23cm'}
  else if (freqNumber >= 2300 && freqNumber <= 2450) {band = '13cm'}
  else if (freqNumber >= 3300 && freqNumber <= 3500) {band = '9cm'}
  else if (freqNumber >= 5650 && freqNumber <= 5925) {band = '6cm'}
  else if (freqNumber >= 10000 && freqNumber <= 10500) {band = '3cm'}
  else if (freqNumber >= 24000 && freqNumber <= 24250) {band = '1.25cm'}
  else if (freqNumber >= 47000 && freqNumber <= 47200) {band = '6mm'}
  else if (freqNumber >= 75500 && freqNumber <= 81000) {band = '4mm'}
  else if (freqNumber >= 119980 && freqNumber <= 123000) {band = '2.5mm'}
  else if (freqNumber >= 134000 && freqNumber <= 149000) {band = '2mm'}
  else if (freqNumber >= 241000 && freqNumber <= 250000) {band = '1mm'}

  let line = ''.concat(
    `<QSO_DATE:${dateString.length}>${dateString} `,
    `<TIME_ON:${time.length}>${time} `,
    `<TIME_OFF:${time.length}>${time} `,
    `<CALL:${otherCallsign.length}>${otherCallsign} `,
    `<FREQ:${freq.length}>${freq} `,
    `<BAND:${band.length}>${band} `,
    `<MODE:${mode.length}>${mode} `,
    `<OPERATOR:${operator.length}>${operator} `,
    `<STATION_CALLSIGN:${ownCallsign.length}>${ownCallsign} `
  )
  if (comment && comment !== '') {
    line += `<COMMENT:${comment.length}>${comment} `;
  }

  if (ownSummit && ownSummit !== '') {
    line += `<MY_SOTA_REF:${ownSummit.length}>${ownSummit} `;
  }

  if (chasedSummit && chasedSummit !== '') {
    line += `<QTH:${chasedSummit.length}>${chasedSummit} `;
    line += `<SOTA_REF:${chasedSummit.length}>${chasedSummit} `;
  }

  if (rstTx && rstTx !== '') {
    line += `<RST_SENT:${rstTx.length}>${rstTx} `;
  }

  if (rstRx && rstRx !== '') {
    line += `<RST_RCVD:${rstRx.length}>${rstRx} `
  }

  return `${line}<EOR>\r\n`;
}
