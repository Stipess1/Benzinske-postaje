import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { pluginWarn } from '@ionic-native/core/decorators/common';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { AnimationController, Platform } from '@ionic/angular';
import { Map, tileLayer, marker, circleMarker, icon, Icon } from 'leaflet';
import { Postaja } from '../benzinska/postaja';
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
    private animationController: AnimationController,
    private router: Router,
    private route: ActivatedRoute) { }

  map: Map;

  ngOnInit() { }

  ionViewDidEnter() {
    this.loadMap();
    const animation = this.animationController.create().addElement(document.getElementById('karte')).iterations(1).duration(500).fromTo('opacity', 0, 1);
    animation.play();
    this.service.tabs('map');

  }

  ionViewWillEnter() {

    this.statusBar.backgroundColorByHexString("#80e3e3e3");
  }

  ionViewWillLeave() {
    const animation = this.animationController.create().addElement(document.getElementById('karte')).iterations(1).duration(500).fromTo('opacity', 1, 0);
    animation.play();
    // this.subscription.unsubscribe();
  }

  loadMap() {
    if (this.map == undefined) {
      if (!this.platform.is('cordova')) {
        this.service.lat = 45.8285372;
        this.service.lon = 16.1101218;
      }
      this.map = new Map("karta", {
        zoomControl: false,
        preferCanvas: true
      }).setView([this.service.lat, this.service.lon], 13);

      tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(this.map);

      marker([this.service.lat, this.service.lon]).bindPopup("Vi ste ovdje!").addTo(this.map);
      for (let i = 0; i < this.service.svePostaje.length; i++) {
        let benzinska = this.service.svePostaje[i];

        // jedna postaja ima lat zapisano ovako kordinatu, pa nju ne gledamo.
        if (benzinska.lat.toString() !== "15° 31.2440' E") {


          let strokeColor;
          if (benzinska.otvoreno)
            strokeColor = "#28ba62";
          else
            strokeColor = "#CF3C4F";

          circleMarker([benzinska.long, benzinska.lat], { color: strokeColor, weight: 2 }).bindPopup("<ion-spinner name='crescent'></ion-spinner>", { className: 'popup' }).addTo(this.map).on('click', (ev) => {
            this.markerClick(ev, benzinska);
          });

        }

      }
    }
  }

  markerClick(event: any, benzinska: Postaja) {

    for (let i = 0; i < this.service.svePostaje.length; i++) {
      let item = this.service.svePostaje[i];

      if (item.lat === benzinska.lat && item.long === benzinska.long) {

        let bengImg = "";
        let otvoreno = "";
        let dizel = "margin-top: 0; width: 36px;height: 36px;background-color: #2C313C;color: white;margin-right: 5px; border-radius: 5px;text-align: center;padding: 0.8em 0 0;margin: auto;"
        let benzin = "margin-top: 0;background-color: #8DD374;width: 36px;height: 36px;color: white;border-radius: 100%; text-align: center;padding: 0.8em 0 0;margin: auto;"
        let textGorivo = "font-weight: bold; text-align: center;"
        let cijena = "font-weight: bold;text-align: center;margin-top: 10px;"
        let listaGoriva = '<ion-grid><ion-row>';
        if (!benzinska.img.includes("http://localhost") && !benzinska.img.includes("null")) {
          bengImg = '<ion-img style="width: 50%;" src="' + benzinska.img + '"></ion-img>';
        }

        if (benzinska.otvoreno) {
          otvoreno = '<ion-chip color="success"><ion-label>Otvoreno</ion-label></ion-chip>';
        } else {
          otvoreno = '<ion-chip color="danger"><ion-label>Zatvoreno</ion-label></ion-chip>';
        }
        // limitiraj prikaz goriva na popupu na 2
        let threshold = 0;
        for (let i = 0; i < benzinska.cijenici.length; i++) {
          let benz = benzinska.cijenici[i];

          if ((benz.vrstaGorivaId == 8 || benz.vrstaGorivaId == 7) && threshold < 2) {
            listaGoriva = listaGoriva.concat('<ion-col size="6" style="flex: display; flex-direction: column;"><p style="' + dizel + '">B</p><p style="' + textGorivo + '">' + benz.naziv + '</p><p style="' + cijena + '">' + benz.cijena + '<span style="font-weight: normal;color: rgb(59, 59, 59);"> kn/L</span></p></ion-col>')
            threshold++;
          }
          else if ((benz.vrstaGorivaId == 1 || benz.vrstaGorivaId == 2 || benz.vrstaGorivaId == 5 || benz.vrstaGorivaId == 6) && threshold < 2) {
            listaGoriva = listaGoriva.concat('<ion-col size="6" style="flex: display; flex-direction: column;"><p style="' + benzin + '">E</p><p style="' + textGorivo + '">' + benz.naziv + '</p><p style="' + cijena + '">' + benz.cijena + '<span style="font-weight: normal;color: rgb(59, 59, 59);"> kn/L</span></p></ion-col>');
            threshold++;
          } else if (threshold == 2) break;
        }
        listaGoriva = listaGoriva.concat('</ion-row></ion-grid>');

        if (benzinska.trenutnoRadnoVrijeme == undefined)
          benzinska.trenutnoRadnoVrijeme = "";

        let html = '<div style="display: flex; flex-direction: column; align-items: center; font-family: Varela Round, sans-serif !important;">' +
          '<p style="margin-bottom:0; margin-top: 5px;">Radno vrijeme: ' + benzinska.trenutnoRadnoVrijeme +
          '</p>' + otvoreno +
          '<h5 style="margin-bottom: 10px; margin-top: 5px; text-align: center;">' + benzinska.naziv + '</h5>' +
          bengImg +
          '<div style="display: flex; flex-direction: row; align-items: center; margin-top: 5px;"><ion-icon color="medium" name="home-outline"></ion-icon>' +
          '<p style="margin-bottom:0; margin-top: 5px; margin-left: 5px;">' + benzinska.adresa + '</p></div>' +
          '<div style="display: flex; flex-direction: row; align-items: center; margin-top: 5px;"><ion-icon name="navigate-outline" color="medium"></ion-icon>' +
          '<p style="margin-bottom:0; margin-top: 5px; margin-left: 5px;">' + benzinska.udaljenost + ' km</p></div>' +
          listaGoriva +
          '<ion-button id="bs'+benzinska.id+'" style="--box-shadow: 0; --border-radius: 10px; --background: rgba(255, 255, 255, 0);" color="light">Detalji</ion-button>' +
          '</div>';

        event.target.setPopupContent(html);
        let link = document.querySelector("#bs" + benzinska.id);
       
        if (link) {
          
          link.addEventListener("click", event => {
            this.service.trenutnaBenga = benzinska;
            console.log(benzinska);

            this.router.navigate(['/pocetna/detalji/'], { relativeTo: this.route });

          });
        }

      }
    }
  }
}
