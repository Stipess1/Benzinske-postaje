import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { pluginWarn } from '@ionic-native/core/decorators/common';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { AnimationController, Platform } from '@ionic/angular';
import { Map,tileLayer,marker,circleMarker } from 'leaflet';
import { BenzinskePostajeService } from '../service/benzinske-postaje.service';

@Component({
  selector: 'app-karta',
  templateUrl: './karta.component.html',
  styleUrls: ['./karta.component.scss'],
})
export class KartaComponent implements OnInit {

  constructor(private platform: Platform, 
    private service: BenzinskePostajeService,
    private statusBar: StatusBar,
    private animationController: AnimationController) { }

  map: any;

  ngOnInit() {
  }

  ionViewDidEnter() {
    this.loadMap();
    const animation = this.animationController.create().addElement(document.getElementById('karte')).iterations(1).duration(500).fromTo('opacity', 0, 1);
    animation.play();
    this.service.tabs('map');
    
  }

  ionViewWillEnter() {
    // this.statusBar.styleDefault();
    // this.statusBar.overlaysWebView(true);
    // this.statusBar.height()
    
    
    this.statusBar.backgroundColorByHexString("#80e3e3e3");
  }

  ionViewWillLeave() {
    const animation = this.animationController.create().addElement(document.getElementById('karte')).iterations(1).duration(500).fromTo('opacity', 1, 0);
    animation.play();
    // this.subscription.unsubscribe();
  }

  loadMap() {
    if(this.map == undefined) {
      if(!this.platform.is('cordova')) {
        this.service.lat = 45.8285372;
        this.service.lon = 16.1101218;
      }
      this.map = new Map("karta", {
        zoomControl: false,
        preferCanvas: true
      }).setView([this.service.lat,this.service.lon], 13);

      tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(this.map);
      for(let i = 0; i < this.service.sveBenzinske.length; i++) {
        let benzinska = this.service.sveBenzinske[i];
        console.log(i);
        if(benzinska.lat.toString() !== "15° 31.2440' E")
          circleMarker([benzinska.lon, benzinska.lat]).bindPopup(benzinska.ime).addTo(this.map);
       
      }
    }
  }
}
