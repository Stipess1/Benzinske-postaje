import { Component, OnInit } from '@angular/core';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { AnimationController } from '@ionic/angular';
import { BenzinskePostajeService } from '../service/benzinske-postaje.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit {

  constructor(private service: BenzinskePostajeService,
    private animationController: AnimationController,
    private statusBar: StatusBar) { }

  ngOnInit() {

  }

  ionViewWillEnter() {
    const animation = this.animationController.create().addElement(document.getElementById('postavke')).iterations(1).duration(500).fromTo('opacity', 0, 1);
    animation.play();
    this.service.tabs('settings');
    document.getElementById('postavke').style.marginTop = this.service.insetBar + "px";
    this.statusBar.backgroundColorByHexString('#ffffff');
  }
}
