import { Component, OnInit } from '@angular/core';
import { NavParams, PopoverController } from '@ionic/angular';
import { Station } from '../../../types';

@Component({
  selector: 'app-edit-call',
  templateUrl: './edit-call.component.html',
  styleUrls: ['./edit-call.component.scss'],
})
export class EditCallComponent implements OnInit {
  station: Station;
  isNew = false;

  ngOnInit() {}

  constructor(
    navParams: NavParams,
    private popoverController: PopoverController
  ) {
    this.station = navParams.data.station;
    this.isNew = this.station.callsign === '' ;
  }

  callCheck(event) {
    this.station.callsign = event.target.value.toUpperCase();
  }

  async dismissAndSave() {
    await this.popoverController.dismiss(true);
  }
}
