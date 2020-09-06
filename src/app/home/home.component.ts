import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { HTTP } from '@ionic-native/http/ngx';
import { RadnoVrijeme } from '../benzinska/radnovrijeme';
import { Benzinska } from '../benzinska/benzinska';
import { BenzinskePostajeService } from '../service/benzinske-postaje.service';
import pako from 'pako';
import { BenzinskaOsnovni } from '../benzinska/benzinskaOsnovni';
import { Gorivo } from '../benzinska/gorivo';
import { Platform, ToastController, PopoverController, AnimationController } from '@ionic/angular';
import { Search } from '../search/model/search';
import { PopoverComponent } from '../popover/popover.component';
import { ActivatedRoute, Router } from '@angular/router';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Usluge } from '../benzinska/usluge';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { Diagnostic } from '@ionic-native/diagnostic/ngx';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {

  private benge: Benzinska[] = [];
  public jsonBenge: BenzinskaOsnovni[] = [];
  public trenutnoGorivo: string;
  public searching: boolean = false;
  public gradovi: Search[] = [];
  public permission: boolean;
  public loadedData: boolean = false;
  public reloading: boolean = false;
  public grad: string = "blizini";
  // -
  // https://nominatim.org/release-docs/develop/api/Search/

  constructor(
        private httpNative: HTTP,
        private http: HttpClient,
        public benzinske: BenzinskePostajeService,
        private platform: Platform,
        private toastController: ToastController,
        private popoverController: PopoverController,
        private router: Router,
        private route: ActivatedRoute,
        private statusBar: StatusBar,
        private geolocation: Geolocation,
        private androidPermissions: AndroidPermissions,
        private diagnostic: Diagnostic,
        private animationController: AnimationController) { }

  ngOnInit() {
    this.trenutnoGorivo = "DIZELA";

    this.platform.ready().then(data => {
      // this.init();

      this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.ACCESS_COARSE_LOCATION).then(
        result => {
          console.log('Has permission?',result.hasPermission);
          this.permission = result.hasPermission;
        })
      
      
        this.androidPermissions.requestPermissions([this.androidPermissions.PERMISSION.ACCESS_COARSE_LOCATION, this.androidPermissions.PERMISSION.ACCESS_FINE_LOCATION]).then(
          data =>{
            
            if(data.hasPermission) {
            
              this.diagnostic.isGpsLocationEnabled().then((gps) => {
                if(gps)
                  this.geolocation.getCurrentPosition().then((resp) => {
                  
                    this.benzinske.lat = resp.coords.latitude;
                    this.benzinske.lon = resp.coords.longitude;
                    this.init();
    
                  }).catch(err => {
                    console.log("err: "+err);
                    
                  });
                else 
                  this.presentToast();
              })

            } else {
              console.log("Nema Permission");
            }
          }
        );
      
    });
  }

  async presentToast() {
    const toast = await this.toastController.create({
      message: "GPS je isključen, upalite GPS.",
      duration: 2000
    });
    toast.present();
  }

  ionViewWillEnter() {
    this.statusBar.backgroundColorByHexString('#EBEBEB');
  }
  ionViewDidEnter() {
    const animation = this.animationController.create().addElement(document.getElementById('home')).iterations(1).duration(500).fromTo('opacity', 0, 1);
    animation.play();
  }

  onInput() {
    this.searching = true;
  }

  change(event: any) {
    let query = event.target.value;
    
    if(query.length > 0) {
      this.gradovi = [];
      this.benzinske.getQuery(query).then(data => {
        let json = data.data;
        
        json = json.substr(7, json.length-8);
        json = JSON.parse(json);

        let loop = 10;

        if(json.length < loop) loop = json.length;

        for(let i = 0; i < loop; i++) {
          let search = new Search();

          search.postanski = json[i]['PLZ'];
          search.mjesto = json[i]['area'];
          search.grad = json[i]['city'];
          search.naselje = json[i]['street'];

          this.gradovi.push(search);
        }
      });
    } 
    
  }

  focus() {
    this.searching = true;
  }

  clear() {
    this.benzinske.trenutniGrad = undefined;
    this.benzinske.trenutniTekst = "";
  }

  cancel() {
    this.searching = false;
  }

  setGrad(grad: Search) {
    this.benzinske.trenutniGrad = grad;
    if(grad.naselje != '')
      this.benzinske.trenutniTekst = grad.naselje + ", " + grad.grad;
    else
      this.benzinske.trenutniTekst = grad.grad;

    console.log(grad.grad);
    let split;
    if(grad.grad.includes(",")) {
      split = grad.grad.split(",");
      grad.grad = split[0];
    }

    this.benzinske.getCordsOfCity(grad).then(resp => {
      let json = JSON.parse(resp.data);
      console.log(json);
      
      let lat = json[0]['lat'];
      let lon = json[0]['lon'];

      this.benzinske.lat = lat;
      this.benzinske.lon = lon;

      console.log("lat: " + lat + " lon: " + lon + " grad: " + grad.grad);
      this.radius("", true);
    });
    this.searching = false;
  }

  radius(event: any, bool: boolean) {
    let value;
    if(!bool && event !== ""){
      value = event.target.value;
    } else {
      value = 5;
    }
  
    this.benzinske.filterBenga = [];
    this.reloading = true;
    if(!bool) {
      this.geolocation.getCurrentPosition().then((resp) => {

        this.benzinske.lat = resp.coords.latitude;
        this.benzinske.lon = resp.coords.longitude;
        
        for(let i = 0; i < this.jsonBenge.length; i++) {
          let benga = this.jsonBenge[i];
          let udaljenost = this.benzinske.calculateDistance(benga.lat, benga.lon);
          udaljenost = Math.round(udaljenost * 10) / 10
          benga.udaljenost = udaljenost;
          
          if(udaljenost <= value) {
            this.click(benga.id.substr(1), benga);
          }
          
        }

        // for(let i = 0; i < this.benzinske.filterBenga.length; i++) {
        //   let temp = this.benzinske.filterBenga[i];
        //   if(temp.udaljenost > value) {
        //     this.benzinske.filterBenga.splice(i, 1);
        //   }
        // }
  
      }).catch(err => {
        console.log("err: "+err);
        
      });
    } else {
      for(let i = 0; i < this.jsonBenge.length; i++) {
        let benga = this.jsonBenge[i];
        let udaljenost = this.benzinske.calculateDistance(benga.lat, benga.lon);
        udaljenost = Math.round(udaljenost * 10) / 10
        benga.udaljenost = udaljenost;
  
        if(udaljenost <= value) {
          this.click(benga.id.substr(1), benga);
        }
      }
    }
    
    this.reloading = false;
  }
  // funkcija se zove nakon sto korisnik promjeni grad, udaljenost se racuna po centru grada

  init() {

    this.benzinske.getData().then(data => {
      let json = JSON.parse(data.data);

      for(let i = 0; i < json.length; i++) {
        let benga = new BenzinskaOsnovni();
        benga.id = json[i]['PoiID'];

        benga.mjesto = json[i]['Alias'];

        benga.ime = json[i]['CategoryName'];

        if(benga.ime == "ostale benzinske postaje")
          benga.ime = benga.mjesto;

        // hardcodamo jer nema drugog nacina
        if(benga.ime == "Tifon") {
          benga.img = "https://tifon.hr/images/fb-tifon-logo.jpg";
        } else if(benga.ime == "INA") {
          benga.img = "https://ina.ea93.work/wp-content/uploads/2020/01/ina-logo-big-2.jpg";
        } else if(benga.ime == "Crodux derivati") {
          benga.img = "https://scontent.fzag4-1.fna.fbcdn.net/v/t1.0-9/42576275_2414705741890598_121577626362970112_n.png?_nc_cat=107&_nc_sid=09cbfe&_nc_eui2=AeFc-WfsL5AWx5vizwUuKaMOTKZFDZgHr8ZMpkUNmAevxjnTzTLZC2QLpYSQsezKiIlxwrE-1HJg_UIM1NvnNfEQ&_nc_ohc=KCw3UKw8g7kAX9qj71S&_nc_ht=scontent.fzag4-1.fna&oh=62988a1e1b667337b5319d18b109f900&oe=5EC6DD05";
        } else if(benga.ime == "Petrol") {
          benga.img = "https://webservis.mzoe-gor.hr/img/obv_9_logo.png";
        } else if(benga.ime == "Lukoil") {
          benga.img = "https://www.soundsetragusa.hr/sites/default/files/lukoil.jpg?width=825&height=550&slideshow=true&slideshowAuto=false&slideshowSpeed=2000&transition=elastic&speed=350";
        } 

        benga.lat = json[i]['Lat'];
        benga.lon = json[i]['Lon'];
        let udaljenost = this.benzinske.calculateDistance(benga.lat, benga.lon);
        udaljenost = Math.round(udaljenost * 10) / 10;
        benga.udaljenost = udaljenost;

        this.jsonBenge.push(benga);

        if(udaljenost <= 5)
          this.click(benga.id.substr(1), benga);

      }
      
      this.loadedData = true;
   });
  }

  click(id: string, benz: BenzinskaOsnovni) {  

    this.benzinske.getPumpData(id)
          .then(data => {
            let json = JSON.parse(data.data);

            let htmlText = json['Content'];
            let doc = new DOMParser().parseFromString(htmlText, "text/html");
            let vrstaGorivaArray = [];
            let cijenik = [];
            let benga = new Benzinska();
            
            benga.lat = benz.lat;
            benga.lon = benz.lon;
            let radnoVrijeme = new RadnoVrijeme();
            let slika = doc.getElementsByClassName("iw-top__icon")[0].querySelectorAll('img')[0].src;
            
            let grad = doc.getElementsByClassName("iw-section")[3].getElementsByClassName("iw-row")[1].getElementsByClassName("iw-value")[0].innerHTML;
            let adresa = doc.getElementsByClassName("iw-section")[3].getElementsByClassName("iw-row")[0].getElementsByClassName("iw-value")[0].innerHTML;
            let vrijeme = doc.getElementById("rv").getElementsByClassName("iw-row");
            if(vrijeme.length == 2) {
              radnoVrijeme.ponPet = vrijeme[0].getElementsByClassName("iw-col--right")[0].innerHTML;
              radnoVrijeme.sub = vrijeme[1].getElementsByClassName("iw-col--right")[0].innerHTML;
            } else {
              radnoVrijeme.ponPet = vrijeme[0].getElementsByClassName("iw-col--right")[0].innerHTML;
              radnoVrijeme.sub = vrijeme[1].getElementsByClassName("iw-col--right")[0].innerHTML;
              radnoVrijeme.ned = vrijeme[2].getElementsByClassName("iw-col--right")[0].innerHTML;
              let temp = vrijeme[3];
              if(temp != undefined)
                radnoVrijeme.praznik = vrijeme[3].getElementsByClassName("iw-col--right")[0].innerHTML;
            }
            let usluge; 
            let listaUsluga = [];
            if(doc.getElementById("features") != null) {
              usluge = doc.getElementById("features").getElementsByClassName("iw-col-container")[0].innerHTML;
              let lUsluga = usluge.split(",");
              for(let i = 0; i < lUsluga.length; i++) {
                if(i != 0)
                  lUsluga[i] = lUsluga[i].replace(" ", "");
              }
              // console.log(lUsluga);
              for(let i = 0; i < lUsluga.length; i++) {
                listaUsluga.push(new Usluge(lUsluga[i]));
              }
            }
            
            let imeFirme = doc.getElementsByClassName("iw-top")[0].getElementsByClassName("iw-title")[0].innerHTML;
            let imeBenge = doc.getElementsByClassName("iw-top")[0].getElementsByClassName("iw-title")[1].innerHTML;
            
            let vrsteGoriva = doc.getElementById("fueltypes").getElementsByClassName("iw-section__content")[0].getElementsByClassName("label");
            for(let i = 0; i < vrsteGoriva.length; i++) {
              let split = vrsteGoriva[i].innerHTML.split(":");
              vrstaGorivaArray[i] = split[0].replace("&nbsp;", " ");
              cijenik[i] = split[1].slice(0, -5);
            }
            let imaGorivo = false;
            if(this.trenutnoGorivo == "DIZELA") {
              for(let i = 0; i < vrstaGorivaArray.length; i++) {
                let lower = vrstaGorivaArray[i].toLowerCase().replace(/ /g, "");
                if(lower === "eurodiesel" || lower === "eurodizel" || lower === "eurodieselbs" 
                || lower === "evoeurodieselbs" || lower === "eurodizelbs") {
                  benga.gorivo = cijenik[i];
                  imaGorivo = true;
                } 
              }
            } else if(this.trenutnoGorivo == "BENZINA") {
              for(let i = 0; i < vrstaGorivaArray.length; i++) {
                let lower = vrstaGorivaArray[i].toLowerCase().replace(/ /g, "");
                if(lower === "eurosuper95" || lower === "qmaxeurosuper95" || lower === "evoeurosuper95bs" || 
                lower === "eurosuperbs95" || lower === "eurosuper95bsmaxpower" || lower === "eurosuper95bs" || lower ==="eurosuper95classplus") {
                  benga.gorivo = cijenik[i];
                  imaGorivo = true;
                }
              }
            } else if(this.trenutnoGorivo == "AUTOPLIN") {
              for(let i = 0; i < vrstaGorivaArray.length; i++) {
                let lower = vrstaGorivaArray[i].toLowerCase().replace(/ /g, "");
                if(lower === "lpg" || lower === "evolpg" 
                  || lower === "autoplinmaxpower" 
                  || lower === "autoplin(unp)"
                  || lower === "qmaxlpgautoplin"
                  || lower === "autoplin") {
                    benga.gorivo = cijenik[i];
                    imaGorivo = true;
                  }
              }
            }
              

            if(imeFirme.includes("Konzum")) {     
              slika = "https://www.konzum.hr/assets/1i0/frontend/facebook/facebook_meta_image-5b88c5da1a557eaf6501d1fb63f883285f9346300d9b2e0a196dc32047a9542a.png";
            } else if(imeFirme.includes("AGS")) {             
              slika = "/assets/icon/pump/ags.png";
            }

            benga.adresa = adresa;
            benga.grad = grad;
            benga.radnoVrijeme = radnoVrijeme;
            benga.kompanija = imeFirme;
            benga.ime = imeBenge;
            benga.img = slika;
            benga.vrsteGoriva = vrstaGorivaArray;
            benga.id = id;
            benga.cijenik = cijenik;
            benga.imaGorivo = imaGorivo;
            benga.udaljenost = benz.udaljenost;
            if(usluge != undefined)
              benga.usluge = listaUsluga;

            // this.benge.push(benga);
            if(imaGorivo) {
              this.benzinske.filterBenga.push(benga);
              setTimeout(() => {
                const animation = this.animationController.create().addElement(document.getElementById(""+benga.id)).
                duration(300).iterations(1).fromTo('opacity','0', '1');
  
                animation.play();
              }, 50)
              console.log("play");
              
            }
              
          });
      }

    get(benga: Benzinska) {
        
        this.benzinske.trenutnaBenga = benga;
        this.router.navigate(['/detalji/'], {relativeTo: this.route});
      }
    
    input(event: any) {
      let query = event.target.value;

      this.benzinske.getQuery(query).then(data => {
        let json = data.data;

        console.log(json);
        
        json = json.substr(7, json.length-8);
        json = JSON.parse(json);
        console.log(json);
      });
    }

    ionViewDidLeave() {
      const animation = this.animationController.create().addElement(document.getElementById('home')).iterations(1).duration(500).fromTo('opacity', 1, 0);
      animation.play();
    }
    selectChange(event: any) {
      let value = event.target.value;

      this.trenutnoGorivo = value;
      this.getBenzin(this.trenutnoGorivo);
      
    }

    async filter(ev: any) {
      console.log("filter");
      
      const popover = await this.popoverController.create({
        component: PopoverComponent,
        event: ev,
        translucent: true
      });

      this.benzinske.popover = popover;

      return await popover.present();
    }

    getBenzin(gorivo: string) {
      if(gorivo === "DIZELA") {
        for(let i = 0; i < this.benzinske.filterBenga.length; i++) {
          for(let j = 0; j < this.benzinske.filterBenga[i].vrsteGoriva.length; j++) {
            let lower = this.benzinske.filterBenga[i].vrsteGoriva[j].toLowerCase().replace(/ /g, "");
            console.log("lower: "+lower);
            
            if(lower === "eurodiesel" || lower === "eurodizel" || lower === "eurodieselbs" 
            || lower === "evoeurodieselbs" || lower === "eurodizelbs") {
              this.benzinske.filterBenga[i].gorivo = this.benzinske.filterBenga[i].cijenik[j];
              console.log(this.benzinske.filterBenga[i].gorivo.replace(",","."));
              
            }
          }
        }
      } else if(gorivo === "BENZINA"){
        for(let i = 0; i < this.benzinske.filterBenga.length; i++) { 
          for(let j = 0; j < this.benzinske.filterBenga[i].vrsteGoriva.length; j++) {
            let lower = this.benzinske.filterBenga[i].vrsteGoriva[j].toLowerCase().replace(/ /g, "");
            if(lower === "eurosuper95" || lower === "qmaxeurosuper95" || lower === "evoeurosuper95bs" || 
            lower === "eurosuperbs95" || lower === "eurosuper95bsmaxpower" || lower === "eurosuper95bs" || lower ==="eurosuper95classplus") {
              this.benzinske.filterBenga[i].gorivo = this.benzinske.filterBenga[i].cijenik[j];
            }
          }
        }
      } else if(gorivo === "AUTOPLIN") {
        for(let i = 0; i < this.benzinske.filterBenga.length; i++) {
          this.benzinske.filterBenga[i].gorivo = "---";
          for(let j = 0; j < this.benzinske.filterBenga[i].vrsteGoriva.length; j++) {
            console.log(this.benzinske.filterBenga[i].vrsteGoriva[j]);
            
            
            let lower = this.benzinske.filterBenga[i].vrsteGoriva[j].toLowerCase().replace(/ /g, "");
            console.log(lower);
            if(lower === "lpg" || lower === "evolpg" 
            || lower === "autoplinmaxpower" 
            || lower === "autoplin(unp)"
            || lower === "qmaxlpgautoplin"
            || lower === "autoplin")
              this.benzinske.filterBenga[i].gorivo = this.benzinske.filterBenga[i].cijenik[j];
          }
        }
      } else if(gorivo === "PLAVI-DIZEL") {
        for(let i = 0; i < this.benzinske.filterBenga.length; i++) {
          this.benzinske.filterBenga[i].gorivo = "---";
          for(let j = 0; j < this.benzinske.filterBenga[i].vrsteGoriva.length; j++) {
            let lower = this.benzinske.filterBenga[i].vrsteGoriva[j].toLowerCase().replace(/ /g, "");
            if(lower === "eurodieselbsplavi" || lower === "eurodizelplavi" || lower === "plavidizel") {
              this.benzinske.filterBenga[i].gorivo = this.benzinske.filterBenga[i].cijenik[j];
            }
          }
        }
      }
    }

}