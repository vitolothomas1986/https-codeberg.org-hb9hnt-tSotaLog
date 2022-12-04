import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SpotsModalPage } from './spots-modal.page';

const routes: Routes = [
  {
    path: '',
    component: SpotsModalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SpotsModalPageRoutingModule {}
