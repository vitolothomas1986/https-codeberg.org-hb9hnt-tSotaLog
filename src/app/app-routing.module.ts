import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule)
  },
  { path: 'qso-edit-modal', loadChildren: './qso-edit-modal/qso-edit-modal.module#QsoEditModalPageModule' },
  {
    path: 'callsigns',
    loadChildren: () => import('./callsigns/callsigns.module').then( m => m.CallsignsPageModule)
  }
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules, relativeLinkResolution: 'legacy' })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
