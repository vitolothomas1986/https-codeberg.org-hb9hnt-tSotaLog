import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SpotsModalPageRoutingModule } from './spots-modal-routing.module';

import { SpotsModalPage } from './spots-modal.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SpotsModalPageRoutingModule
  ],
  declarations: [SpotsModalPage]
})
export class SpotsModalPageModule {}
