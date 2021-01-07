import { Component, OnInit } from '@angular/core';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { AnimationController, Platform } from '@ionic/angular';
import { BenzinskePostajeService } from '../service/benzinske-postaje.service';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { EmailComposer } from '@ionic-native/email-composer/ngx';


@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit {

  constructor(private service: BenzinskePostajeService,
    private animationController: AnimationController,
    private statusBar: StatusBar,
    public appVersion: AppVersion,
    private email: EmailComposer,
    private platform: Platform) { }

  public version: string = "";
  public dostupno: boolean;

  ngOnInit() {
    if(this.platform.is('cordova')) {
      this.appVersion.getVersionNumber().then(data => {
        this.version = data;
      })
      this.email.isAvailable().then((ava: boolean) => {
        this.dostupno = ava;
      });
    }
  }

  ionViewWillEnter() {
    const animation = this.animationController.create().addElement(document.getElementById('postavke')).iterations(1).duration(500).fromTo('opacity', 0, 1);
    animation.play();
    this.service.tabs('settings');
    document.getElementById('postavke').style.marginTop = this.service.insetBar + "px";
    this.statusBar.backgroundColorByHexString('#ffffff');
  }

  kontakt() {
    if(this.dostupno) {
      let email = {
        to: 'stjepstjepanovic@gmail.com',
        subject: 'Benzinske postaje',
        isHtml: true
      }

      this.email.open(email);
    }
  }
}
