import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { SpotsService, Spot } from '../../spots.service';

@Component({
  selector: 'app-spots-modal',
  templateUrl: './spots-modal.page.html',
  styleUrls: ['./spots-modal.page.scss'],
})
export class SpotsModalPage implements OnInit {

  spots: Spot[];
  fetchLimit: -0.5;

  constructor(
    public modalController: ModalController,
    private spotsService: SpotsService,
  ) { }

  ngOnInit() {
    this.spotsService
      .fetchSpots(this.fetchLimit)
      .subscribe((data) => {
        this.spots = data;
      });
  }

  dismiss() {
    this.modalController.dismiss();
  }

  pickSpot(spot) {
    this.modalController.dismiss(spot);
  }
}
