import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CallsignsPageRoutingModule } from './callsigns-routing.module';

import { CallsignsPage } from './callsigns.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CallsignsPageRoutingModule
  ],
  declarations: [CallsignsPage]
})
export class CallsignsPageModule {}
