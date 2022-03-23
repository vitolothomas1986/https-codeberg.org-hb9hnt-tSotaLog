import { Component } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { ModalController} from '@ionic/angular';
import { QsoEditModalPage } from './../qso-edit-modal/qso-edit-modal.page';
import { IonRouterOutlet } from '@ionic/angular';
import { Clipboard } from '@awesome-cordova-plugins/clipboard/ngx';
import { ToastController } from '@ionic/angular';
import { SocialSharing } from '@awesome-cordova-plugins/social-sharing/ngx';
import { File } from '@awesome-cordova-plugins/file/ngx';
import { GlobalSettings } from './../globalsettings';
import { Qso, QsoHistory } from './../../types'
import { StorageService } from '../storage.service';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {

  qsoStorage: StorageService;
  qsoHistory: Array<QsoHistory>;
  settings: GlobalSettings;
  recentQsos: Array<Qso>;

  constructor(
    public toastController: ToastController,
    public modalCtrl: ModalController,
    private storage: StorageService, 
    private alertControl: AlertController, 
    private routerOutlet: IonRouterOutlet, 
    private clipboard: Clipboard, 
    private socialSharing: SocialSharing, 
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
    const alert = await this.alertControl.create({
      header: 'Archive recent QSOs',
      inputs: [
        {
          name: 'name',
          type: 'text',
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
        duration: 2000
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
        duration: 2000
      });
      toast.present();

  }

  async exportQsos(index: number) {
    const alert = await this.alertControl.create({
      header: 'Export QSOs',
      message: 'make sure you got the OP settings right',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Copy to clipboard',
          handler: () => {
            this.copyToClipboard(index);
          }
        },
        /*
        {
          text: 'Share',
          handler: (alertData) => {
            this.socialShare(index);
          }
        },
        */
         {
          text: 'Save file',
          handler: () => {
            this.saveFile(index);
          }
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

  async copyToClipboard(index: number) {
    this.clipboard.copy(this.generateSotaCsv(index));
    const toast = await this.toastController.create({
      message: 'Your log has been copied!',
      duration: 2000
    });
    toast.present();
  }

  async saveFile(index: number) {
    const name = this.qsoHistory[index].name;
    const csv = this.generateSotaCsv(index);
    const date = (new Date()).toISOString().split('T')[0];
    const filename = `${name}_${date}.csv`
    let message = '';
    let directory;

    // Try to set up a more user friendly app folder 
    try {
      await this.file.checkDir(this.file.externalRootDirectory, 'tSotaLog');
    } catch {
      await this.file.createDir(this.file.externalRootDirectory, 'tSotaLog', false);
    }

    // Check again whether the directory exists
    try {
      await this.file.checkDir(this.file.externalRootDirectory, 'tSotaLog');
      directory = `${this.file.externalRootDirectory}/tSotaLog`;
    } catch {
      directory = this.file.externalDataDirectory;
    }

    try {
      await this.file.writeFile(directory, filename, csv, { replace: true });
      message = `File saved to '${directory.replace(/^file:\/\//, "")}/${filename}'`;
    } catch {
      message = "ERROR: Failed to save file!"
    }

    const toast = await this.toastController.create({
      message: message,
      duration: 5000
    });
    toast.present();
  }
  
  /*
  We remove this for now
  async socialShare(index: number) {
    const name = this.qsoHistory[index].name;
    const csv = this.generateSotaCsv(index);
    const date = (new Date()).toISOString().split('T')[0];
    const filename = `${name}_${date}.csv`
    const res = await this.file.writeFile(this.file.externalDataDirectory, filename, csv, { replace: true });

    const options = {
      //message: "csv",
      //files: res.toURL() 
      files: [res.toURL]
    };

    this.socialSharing.shareWithOptions(options);
  }
  */

  generateSotaCsv(index: number): string {

    const qsosToExport = this.qsoHistory[index].qsoList;
    const includeRst = this.settings.exportSettings.rstComment;
    const includeS2s = this.settings.exportSettings.s2sComment;
    const ownCall = this.settings.opData.callsign;
    let sotaCsvString = '';

    // SotaData expects the CSV to be in chronological order
    qsosToExport.sort((qsoA, qsoB) => {
      const timeA = new Date(`${qsoA.date}T${qsoA.time}Z`);
      const timeB = new Date(`${qsoB.date}T${qsoB.time}Z`);
      if (timeA > timeB) { return 1 }
      if (timeA < timeB) { return -1 }
      return 0;
    });
    
    for (const qso of qsosToExport) {
      let callUsed = ownCall;
      
      // Add a /P in case of a activator log.
      if (this.settings.exportSettings.addPortable && qso.activatorSummit != '') {
        callUsed += "/P";
      }

      let newLine = 'V2,';
      
      newLine += `${callUsed},${qso.activatorSummit},`;
      newLine += `${qso.date},${qso.time},`;
      newLine += `${qso.band}Mhz,${qso.mode},`;

      // Add a /P in case of a chaser log.
      if (this.settings.exportSettings.addPortable && qso.chaserSummit != '') {
        newLine += `${qso.call}/P,`;
      } else {
        newLine += `${qso.call},`;
      }


      newLine += `${qso.chaserSummit},"${qso.comment}`;

      if (includeRst && qso.rstRx) {
        newLine += `${newLine.slice(-1) != '"' && newLine.slice(-1) != ' ' ? " " : ""}`
        newLine += `r${qso.rstRx}`;
      }

      if (includeRst && qso.rstTx) {
        newLine += `${newLine.slice(-1) != '"' && newLine.slice(-1) != ' ' ? " " : ""}`
        newLine += `s${qso.rstTx}`;
      }

      if (includeS2s && qso.chaserSummit != '' && qso.activatorSummit != '') {
        newLine += `${newLine.slice(-1) != '"' && newLine.slice(-1) != ' ' ? " " : ""}`
        newLine += `S2S ${qso.chaserSummit}`;
      }

      newLine += '"\r\n';

      sotaCsvString += newLine; 
    }

    console.log(sotaCsvString);
    return sotaCsvString;
  }

}
