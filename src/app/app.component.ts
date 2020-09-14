import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { ScreenOrientation } from '@ionic-native/screen-orientation/ngx';

import { timer } from 'rxjs';
import { AndroidFullScreen } from '@ionic-native/android-full-screen/ngx';
import { BenzinskePostajeService } from './service/benzinske-postaje.service';
declare var window: any;
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})


export class AppComponent {

  private showSplash: boolean = true;

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private screenOrientation: ScreenOrientation,
    private androidFullScreen: AndroidFullScreen,
    private service: BenzinskePostajeService
  ) {
    this.initializeApp();
  }

  initializeApp() {
    

    this.platform.ready().then(() => {
      this.statusBar.overlaysWebView(true);
      if (window.AndroidNotch) {
        const style = document.documentElement.style;

        window.AndroidNotch.getInsetTop(px => {
          console.log(px+" px");
          if(px != 0)
            this.service.insetBar = px;
          else 
            this.service.insetBar = "20";
          // style.setProperty('--ion-safe-area-top', px + 'px');
        }, (err) => console.error('Failed to get insets top:', err));
      }
      // this.statusBar.backgroundColorByHexString('#ffffff');
      this.statusBar.styleDefault();
      this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT);
      this.splashScreen.hide();
      
    });
  }
}
