import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { pluginWarn } from '@ionic-native/core/decorators/common';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { AnimationController, Platform } from '@ionic/angular';
import { Map,tileLayer,marker,circleMarker } from 'leaflet';
import { Benzinska } from '../benzinska/benzinska';
import { BenzinskePostajeService } from '../service/benzinske-postaje.service';
import { HakParserService } from '../service/hak-parser.service';

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
    private hakParser: HakParserService,
    private router: Router,
    private route: ActivatedRoute) { }

  map: Map;

  ngOnInit() {}

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
        // console.log(benzinska.trenutnoRadnoVrijeme + " - " + benzinska.otvoreno);
        
        if(benzinska.lat.toString() !== "15° 31.2440' E") {

          let strokeColor;
          if(benzinska.otvoreno) 
            strokeColor = "#28ba62";
          else 
            strokeColor = "#CF3C4F";
          
          circleMarker([benzinska.lon, benzinska.lat], {color: strokeColor, weight: 2}).bindPopup("<ion-spinner name='crescent'></ion-spinner>", {className: 'popup'}).addTo(this.map).on('click', (ev) => {
            this.markerClick(ev);
          });
        }
       
      }
    }
  }

  markerClick(event: any) {
    
    for(let i = 0; i < this.service.hakBenzinske.length; i++) {
      let item = this.service.hakBenzinske[i];
      
      if(item.lat === event.latlng.lat && item.lon === event.latlng.lng) {
        console.log(item);
        
        this.hakParser.parse(item).then( beng => {
          console.table(beng);
          
          let bengImg = "";
          let otvoreno = "";
          let dizel = "margin-top: 0; width: 36px;height: 36px;background-color: #2C313C;color: white;margin-right: 5px; border-radius: 5px;text-align: center;padding: 0.7em 0 0;margin: auto;"
          let benzin = "margin-top: 0;background-color: #8DD374;width: 36px;height: 36px;color: white;border-radius: 100%; text-align: center;padding: 0.7em 0 0;margin: auto;"
          let textGorivo = "font-weight: bold; text-align: center;"
          let cijena = "font-weight: bold;text-align: center;margin-top: 10px;"
          let listaGoriva = '<ion-grid><ion-row>';
          if(!beng.img.includes("http://localhost")) {
            bengImg = '<ion-img style="width: 50%;" src="'+beng.img+'"></ion-img>';
          }
          
          if(beng.otvoreno) {
            otvoreno = '<ion-chip color="success"><ion-label>Otvoreno</ion-label></ion-chip>';
          } else {
            otvoreno = '<ion-chip color="danger"><ion-label>Zatvoreno</ion-label></ion-chip>';
          }

          for(let i = 0; i < 2; i++) {
            let benz = beng.vrsteGoriva[i];
            if(benz.toLowerCase().includes("eurodiesel") || benz.toLowerCase().includes("eurodizel")) 
              listaGoriva = listaGoriva.concat('<ion-col size="6"><p style="'+dizel+'">B</p><p style="'+textGorivo+'">'+benz+'</p><p style="'+cijena+'">'+beng.cijenik[i]+'<span style="font-weight: normal;color: rgb(59, 59, 59);"> kn/L</span></p></ion-col>')
            else if(benz.toLowerCase().includes("eurosuper"))
              listaGoriva = listaGoriva.concat('<ion-col size="6"><p style="'+benzin+'">E</p><p style="'+textGorivo+'">'+benz+'</p><p style="'+cijena+'">'+beng.cijenik[i]+'<span style="font-weight: normal;color: rgb(59, 59, 59);"> kn/L</span></p></ion-col>');
          }
          listaGoriva = listaGoriva.concat('</ion-row></ion-grid>');
          console.log(listaGoriva);
          
          let html = '<div style="display: flex; flex-direction: column; align-items: center; font-family: Varela Round, sans-serif !important;">'+
          '<p style="margin-bottom:0; margin-top: 5px;">Radno vrijeme: ' + beng.trenutnoRadnoVrijeme + 
          '</p>'+ otvoreno +
          '<h5 style="margin-bottom: 10px; margin-top: 5px; text-align: center;">'+beng.ime+'</h5>'+
            bengImg +
          '<div style="display: flex; flex-direction: row; align-items: center; margin-top: 5px;"><ion-icon color="medium" name="home-outline"></ion-icon>'+
          '<p style="margin-bottom:0; margin-top: 5px; margin-left: 5px;">'+beng.adresa+'</p></div>'+
          '<div style="display: flex; flex-direction: row; align-items: center; margin-top: 5px;"><ion-icon name="navigate-outline" color="medium"></ion-icon>'+
          '<p style="margin-bottom:0; margin-top: 5px; margin-left: 5px;">'+beng.udaljenost+' km</p></div>'+
            listaGoriva +
          '<ion-button id="b'+beng.id+'" style="--box-shadow: 0; --border-radius: 10px; --background: rgba(255, 255, 255, 0);" color="light">Detalji</ion-button>'+
          '</div>';
          
          event.target.setPopupContent(html);
          let link = document.querySelector("#b"+beng.id);
          if(link) 
            link.addEventListener('click', () => {
              this.service.trenutnaBenga = beng;
              this.router.navigate(['/pocetna/detalji/'], { relativeTo: this.route });
              
            });
   
        });


      }
    }
  }
}
