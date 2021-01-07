import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppComponent } from './app.component';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { HTTP } from '@ionic-native/http/ngx';
import { PopoverComponent } from './popover/popover.component';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { LaunchNavigator } from '@ionic-native/launch-navigator/ngx';
import { ScreenOrientation } from '@ionic-native/screen-orientation/ngx';
import { Diagnostic } from '@ionic-native/diagnostic/ngx';
import {AndroidFullScreen} from "@ionic-native/android-full-screen/ngx";
import { BackgroundMode } from '@ionic-native/background-mode/ngx';
import { LaunchReview } from '@ionic-native/launch-review/ngx';
import { IonicStorageModule } from '@ionic/storage';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { EmailComposer } from '@ionic-native/email-composer/ngx';

@NgModule({
  declarations: [AppComponent, PopoverComponent],
  entryComponents: [PopoverComponent],
  imports: [BrowserModule, IonicModule.forRoot(), IonicStorageModule.forRoot() ,AppRoutingModule, HttpClientModule],
  providers: [
    StatusBar,
    SplashScreen,
    HttpClientModule,
    LaunchNavigator,
    AndroidPermissions,
    ScreenOrientation,
    Geolocation,
    AppVersion,
    EmailComposer,
    Diagnostic,
    BackgroundMode,
    LaunchReview,
    HTTP,
    AndroidFullScreen,
    HttpClient,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
