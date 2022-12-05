import { GlobalSettings } from './../globalsettings';
import { Component } from '@angular/core';
import { StatusBar } from '@awesome-cordova-plugins/status-bar/ngx';
import { PickerController } from '@ionic/angular';


@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage {

  darktoggle: any;
  darkModeToggle: boolean;
  settings: GlobalSettings;

  constructor(private globalSettings: GlobalSettings, private statusBar: StatusBar, private pickerControl: PickerController) {

    this.settings = globalSettings;

    if (this.settings.darkmode === true) {
      document.body.classList.add('dark');
      this.darkModeToggle = true;
    }

  }

  toggleDarkMode() {

    this.settings.darkmode = !this.settings.darkmode;
    if (this.settings.darkmode === true) {
      document.body.classList.add('dark');
      this.statusBar.backgroundColorByHexString('#121212');
      this.statusBar.styleBlackOpaque();

    } else {
      document.body.classList.remove('dark');
      this.statusBar.backgroundColorByName('white');
      this.statusBar.styleDefault();
    }

    this.settings.saveToStorage('darkmode' , this.settings.darkmode);

  }

  async toggleExportSettings() {
    await this.settings.exportSettings;
    this.settings.saveToStorage('export-settings', this.settings.exportSettings);

  }

  async saveOpSettingsToStorage() {
    this.settings.saveToStorage('op-data', this.settings.opData);
  }

  ionViewWillLeave() {
   this.saveOpSettingsToStorage();
  }


}
