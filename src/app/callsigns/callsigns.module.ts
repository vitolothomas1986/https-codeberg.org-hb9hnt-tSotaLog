import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ScrollingModule } from '@angular/cdk/scrolling';

import { IonicModule } from '@ionic/angular';

import { CallsignsPageRoutingModule } from './callsigns-routing.module';

import { CallsignsPage } from './callsigns.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ScrollingModule,
    CallsignsPageRoutingModule
  ],
  declarations: [CallsignsPage]
})
export class CallsignsPageModule {}
