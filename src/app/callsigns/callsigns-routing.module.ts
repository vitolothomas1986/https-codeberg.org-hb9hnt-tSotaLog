import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CallsignsPage } from './callsigns.page';

const routes: Routes = [
  {
    path: '',
    component: CallsignsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CallsignsPageRoutingModule {}
