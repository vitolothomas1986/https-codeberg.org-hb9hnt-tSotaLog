import { GlobalSettings } from './globalsettings';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@awesome-cordova-plugins/splash-screen/ngx';
import { StatusBar } from '@awesome-cordova-plugins/status-bar/ngx';
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { Storage } from '@ionic/storage-angular';
import { QsoEditModalPageModule } from './qso-edit-modal/qso-edit-modal.module';
import { EditPopoverComponent } from './edit-popover/edit-popover.component';
import { EditCallComponent } from './callsigns/edit-call/edit-call.component';
import { StorageService } from './storage.service';
import { FormsModule } from '@angular/forms';
import { Clipboard } from '@awesome-cordova-plugins/clipboard/ngx';
import { Chooser } from '@awesome-cordova-plugins/chooser/ngx';
import { File } from '@awesome-cordova-plugins/file/ngx';
import { HttpClientModule } from '@angular/common/http';
import { DatePipe } from '@angular/common';

@NgModule({
    declarations: [AppComponent, EditPopoverComponent, EditCallComponent],
    imports: [
      BrowserModule,
      IonicModule.forRoot(),
      AppRoutingModule,
      QsoEditModalPageModule,
      FormsModule,
      HttpClientModule,
    ],
    providers: [
        AndroidPermissions,
        StatusBar,
        SplashScreen,
        GlobalSettings,
        Clipboard,
        Chooser,
        File,
        DatePipe,
        Storage,
        StorageService,
        { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
    ],
    bootstrap: [AppComponent]
})
export class AppModule {}
