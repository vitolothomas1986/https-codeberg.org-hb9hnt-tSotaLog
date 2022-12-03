import { GlobalSettings } from './../globalsettings';
import { Component, OnInit } from '@angular/core';
import { NavParams, PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-edit-popover',
  templateUrl: './edit-popover.component.html',
  styleUrls: ['./edit-popover.component.scss'],
})
export class EditPopoverComponent implements OnInit {

  qsoParams: any;
  settings: GlobalSettings;

  constructor(
    navParams: NavParams,
    private globalSettings: GlobalSettings,
    private popoverController: PopoverController
  ) {
    this.qsoParams = navParams.data.editedQso;
    this.settings = globalSettings;
  }

  ngOnInit() {}

  // TODO: Don't duplicate those two functions.
  summitCheck(event) {
    const regex = /([A-Za-z]{2})\/?([A-Za-z]{2})-?([0-9]{3})/;
    const newString = event.target.value.replace(regex, '$1/$2-$3').toUpperCase();
    event.target.value = newString;
  }

  callCheck(event) {
    this.qsoParams.callsign = event.target.value.toUpperCase();
  }


  async dismissAndSave() {
    await this.popoverController.dismiss(true);
  }

}
