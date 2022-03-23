import { GlobalSettings } from './globalsettings';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@awesome-cordova-plugins/splash-screen/ngx';
import { StatusBar } from '@awesome-cordova-plugins/status-bar/ngx';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { Storage } from '@ionic/storage-angular';
import { QsoEditModalPageModule } from './qso-edit-modal/qso-edit-modal.module';
import { EditPopoverComponent } from './edit-popover/edit-popover.component';
import { StorageService } from './storage.service';
import { FormsModule } from '@angular/forms';
import { Clipboard } from '@awesome-cordova-plugins/clipboard/ngx';
import { SocialSharing } from '@awesome-cordova-plugins/social-sharing/ngx';
import { File } from '@awesome-cordova-plugins/file/ngx';


@NgModule({
  declarations: [AppComponent, EditPopoverComponent],
  entryComponents: [EditPopoverComponent],
  imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule, QsoEditModalPageModule, FormsModule],
  providers: [
    StatusBar,
    SplashScreen,
    GlobalSettings,
    Clipboard,
    SocialSharing,
    File,
    Storage,
    StorageService,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
