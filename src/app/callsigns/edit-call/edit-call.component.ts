import { Component, OnInit } from '@angular/core';
import { NavParams, PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-edit-call',
  templateUrl: './edit-call.component.html',
  styleUrls: ['./edit-call.component.scss'],
})
export class EditCallComponent implements OnInit {
  callsign: {[key: string]: string};
  isNew = false;

  ngOnInit() {}

  constructor(
    navParams: NavParams,
    private popoverController: PopoverController
  ) {
    this.callsign = navParams.data.callsign;
    this.isNew = this.callsign.call === '' ;
    console.log(this.callsign, this.isNew)
  }

  callCheck(event) {
    this.callsign.call = event.target.value.toUpperCase();
  }


  async dismissAndSave() {
    await this.popoverController.dismiss(true);
  }


}
