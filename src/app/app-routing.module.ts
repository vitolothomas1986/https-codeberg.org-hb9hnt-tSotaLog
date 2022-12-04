import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule)
  },
  { 
    path: 'qso-edit-modal',
    loadChildren: () => import('./qso-edit-modal/qso-edit-modal.module').then( m => m.QsoEditModalPageModule)
  },
  {
    path: 'callsigns',
    loadChildren: () => import('./callsigns/callsigns.module').then( m => m.CallsignsPageModule)
  },
  {
    path: 'spots-modal',
    loadChildren: () => import('./tab1/spots-modal/spots-modal.module').then( m => m.SpotsModalPageModule)
  }
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules, relativeLinkResolution: 'legacy' })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
