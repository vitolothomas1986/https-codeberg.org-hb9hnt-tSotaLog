import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AlertController } from '@ionic/angular';
import { SpotsService, Spot } from '../../spots.service';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-spots-modal',
  templateUrl: './spots-modal.page.html',
  styleUrls: ['./spots-modal.page.scss'],
})
export class SpotsModalPage implements OnInit {

  spots: Spot[];
  // I don't know what the return type of subscribing to
  // a http client get observable is. Feel free to specify
  // the correct type...
  loading: any;
  fetchLimit: number;

  constructor(
    public modalController: ModalController,
    public alertController: AlertController,
    private spotsService: SpotsService,
  ) {
    this.fetchLimit = -2;
  }

  async ngOnInit() {
    await this.loadSpots();
  }

  async loadSpots() {
    this.loading = this.spotsService
      .fetchSpots(this.fetchLimit)
      .pipe(
        catchError(async(error) => {
          let errorMsg;
          if (error.error instanceof ErrorEvent) {
            errorMsg = `${error.error.message}`;
          } else {
            errorMsg = `${error.message}`;
          }
          const alert = await this.alertController.create({
            header: 'Failed to get spots',
            subHeader: 'Check your internet connection!',
            message: errorMsg,
            buttons: ['OK'],
          });

          alert.onWillDismiss().then(() => {
            this.dismiss();
          });
          await alert.present();

          return [] as Spot[];
        })
      )
      .subscribe((data) => {
        this.spots = data;
        this.loading.unsubscribe();
      });
  }

  reload() {
    // Stop previous request if one is still in
    // progress
    if (this.loading && this.loading.unsubscribe) {
      this.loading.unsubscribe();
    }
    this.spots = null;
    this.loadSpots();
  }

  dismiss() {
    this.modalController.dismiss();
  }

  pickSpot(spot) {
    this.modalController.dismiss(spot);
  }
}
