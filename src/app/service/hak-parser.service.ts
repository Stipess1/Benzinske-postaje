import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HTTP } from '@ionic-native/http/ngx';
import { Platform } from '@ionic/angular';
import { Benzinska } from '../benzinska/benzinska';
import { BenzinskaOsnovni } from '../benzinska/benzinskaOsnovni';
import { RadnoVrijeme } from '../benzinska/radnovrijeme';
import { Usluge } from '../benzinska/usluge';
import { BenzinskePostajeService } from './benzinske-postaje.service';

@Injectable({
  providedIn: 'root'
})
export class HakParserService {

  public trenutnoGorivo: string;
  public loadedData: boolean;

  constructor(private benzinske: BenzinskePostajeService,
    private http: HttpClient,
    private platform: Platform) { }


  public parse(benz: BenzinskaOsnovni) {
    return new Promise<Benzinska>((resolve, reject) => {
      if (this.platform.is('cordova'))
        this.benzinske.getPumpData(benz.id.substr(1))
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
            if (vrijeme.length == 2) {
              radnoVrijeme.ponPet = vrijeme[0].getElementsByClassName("iw-col--right")[0].innerHTML;
              radnoVrijeme.sub = vrijeme[1].getElementsByClassName("iw-col--right")[0].innerHTML;
            } else {
              radnoVrijeme.ponPet = vrijeme[0].getElementsByClassName("iw-col--right")[0].innerHTML;
              radnoVrijeme.sub = vrijeme[1].getElementsByClassName("iw-col--right")[0].innerHTML;
              radnoVrijeme.ned = vrijeme[2].getElementsByClassName("iw-col--right")[0].innerHTML;
              let temp = vrijeme[3];
              if (temp != undefined)
                radnoVrijeme.praznik = vrijeme[3].getElementsByClassName("iw-col--right")[0].innerHTML;
            }
            let usluge;
            let listaUsluga = [];
            if (doc.getElementById("features") != null) {
              usluge = doc.getElementById("features").getElementsByClassName("iw-col-container")[0].innerHTML;
              let lUsluga = usluge.split(",");
              for (let i = 0; i < lUsluga.length; i++) {
                if (i != 0)
                  lUsluga[i] = lUsluga[i].replace(" ", "");
              }

              for (let i = 0; i < lUsluga.length; i++) {
                listaUsluga.push(new Usluge(lUsluga[i]));
              }
            }

            let imeFirme = doc.getElementsByClassName("iw-top")[0].getElementsByClassName("iw-title")[0].innerHTML;
            let imeBenge = doc.getElementsByClassName("iw-top")[0].getElementsByClassName("iw-title")[1].innerHTML;

            let vrsteGoriva = doc.getElementById("fueltypes").getElementsByClassName("iw-section__content")[0].getElementsByClassName("label");
            for (let i = 0; i < vrsteGoriva.length; i++) {
              let split = vrsteGoriva[i].innerHTML.split(":");
              vrstaGorivaArray[i] = split[0].replace(/&nbsp;/g, " ");
              cijenik[i] = split[1].slice(0, -5);
            }
            let imaGorivo = false;
            // gorivo.json ima sve podatke o svakom imenu goriva tako da je najbolje loopat kroz to neko rucno dodavat...
            // jer benzinske se ne ucitaju ako ne postoji navedena vrsta goriva.
            if (this.trenutnoGorivo == "DIZELA") {
              for (let i = 0; i < vrstaGorivaArray.length; i++) {
                let lower = vrstaGorivaArray[i].toLowerCase().replace(/ /g, "");
                if (lower === "eurodiesel" || lower === "eurodizel" || lower === "eurodieselbs"
                  || lower === "evoeurodieselbs" || lower === "eurodizelbs" || lower === "eurodieselbsa-motion" || lower === "eurodizelb7") {

                  benga.gorivo = cijenik[i];
                  imaGorivo = true;
                }
              }
            } else if (this.trenutnoGorivo == "BENZINA") {
              for (let i = 0; i < vrstaGorivaArray.length; i++) {
                let lower = vrstaGorivaArray[i].toLowerCase().replace(/ /g, "");
                if (lower === "eurosuper95" || lower === "qmaxeurosuper95" || lower === "evoeurosuper95bs" ||
                  lower === "eurosuperbs95" || lower === "eurosuper95bsmaxpower" || lower === "eurosuper95bs" || lower === "eurosuper95classplus"
                  || lower === "eurosuper95bsa-motion") {
                  benga.gorivo = cijenik[i];
                  imaGorivo = true;
                }
              }
            } else if (this.trenutnoGorivo == "AUTOPLIN") {
              for (let i = 0; i < vrstaGorivaArray.length; i++) {
                let lower = vrstaGorivaArray[i].toLowerCase().replace(/ /g, "");
                if (lower === "lpg" || lower === "evolpg"
                  || lower === "autoplinmaxpower"
                  || lower === "autoplin(unp)"
                  || lower === "qmaxlpgautoplin"
                  || lower === "autoplin"
                  || lower === "autoplin-lpg") {
                  benga.gorivo = cijenik[i];
                  imaGorivo = true;
                }
              }
            }


            if (imeFirme.includes("Konzum")) {
              slika = "https://www.konzum.hr/assets/1i0/frontend/facebook/facebook_meta_image-5b88c5da1a557eaf6501d1fb63f883285f9346300d9b2e0a196dc32047a9542a.png";
            } else if (imeFirme.includes("AGS")) {
              slika = "/assets/icon/pump/ags.png";
            } else if (imeFirme.includes("APIOS")) {
              slika = "https://webservis.mzoe-gor.hr/img/obv_20_logo.png";
            }

            benga.adresa = adresa;
            benga.grad = grad;
            benga.radnoVrijeme = radnoVrijeme;
            benga.kompanija = imeFirme;
            benga.ime = imeBenge;
            benga.img = slika;
            benga.vrsteGoriva = vrstaGorivaArray;
            benga.id = benz.id.substr(1);
            benga.cijenik = cijenik;
            benga.imaGorivo = imaGorivo;
            benga.udaljenost = benz.udaljenost;

            this.http.get('assets/json/postaje.json').subscribe((res: any) => {

              for (let i = 0; i < res['postajas'].length; i++) {
                if (res['postajas'][i]['adresa'] === benga.adresa && res['postajas'][i]['naziv'] === benga.ime) {
                  benga.mzoeId = res['postajas'][i]['id'];
                }
              }
            });

            if (usluge != undefined)
              benga.usluge = listaUsluga;

            benga.trenutnoRadnoVrijeme = this.parseTime(benga);

            if (imaGorivo) 
              resolve(benga);
            else
              reject("Nema goriva");
            
          });
      else {
        // 
        let benga = new Benzinska();
        benga.adresa = "Slavonska avenija 110";
        benga.ime = "BP ZAGREB ISTOK";
        benga.img = "/assets/icon/pump/ags.png";
        benga.udaljenost = 1.2;
        benga.id = "2"
        benga.gorivo = "10.40";
        this.benzinske.filterBenga.push(benga);
        this.loadedData = true;
        this.http.get('assets/json/postaje.json').subscribe((res: any) => {
          console.log(res['postajas'][0]['adresa']);

          for (let i = 0; i < res['postajas'].length; i++) {
            if (res['postajas'][i]['adresa'] === benga.adresa && res['postajas'][i]['ime'] === benga.ime)
              benga.id = res['postajas'][i]['id'];
            // console.log(res['postajas'][i]);

          }
          resolve(benga);
        });
      }
    });


  }
  /**
   * Prima radno vrijeme benzinske (npr. 00:00:00-24:00:00 ), te skracuje
   * zadnje dvije nule i provjerava dali je benzinska trenutno otvorena
   * za odredene benzinske nema radnog vremena za neke dane pa je {vrijeme}
   * undefined
   * @param {Benzinska} benga - Benzinska koju trenutno parsamo
   * @returns {string} - vraca radno vrijeme benzinske (npr. 06:00 - 24:00)
   */
  parseTime(benga: Benzinska) {
    

    let vrijeme;
    let date = new Date();

    if (date.getDay() >= 1 && date.getDay() <= 5) {

      vrijeme = benga.radnoVrijeme.ponPet;

    } else if (date.getDay() == 0) {

      vrijeme = benga.radnoVrijeme.ned;

    } else if (date.getDay() == 6) {
      vrijeme = benga.radnoVrijeme.sub;
    }

    if (vrijeme == undefined) return;

    let splitTime = vrijeme.split("-");

    if (splitTime[0].length == 8) {
      splitTime[0] = splitTime[0].slice(0, splitTime[0].length - 3);
    }

    splitTime[1] = splitTime[1].slice(0, splitTime[1].length - 3);

    let time = splitTime[0] + "-" + splitTime[1];

    let pocetnoVrijeme = splitTime[0].slice(0, splitTime[0].length - 3);
    let zavrsnoVrijeme = splitTime[1].slice(0, splitTime[1].length - 3);

    if (date.getHours() < parseInt(zavrsnoVrijeme) && date.getHours() > parseInt(pocetnoVrijeme)) {
      benga.otvoreno = true;
    } else {
      if (zavrsnoVrijeme === "24" && pocetnoVrijeme == "00")
        benga.otvoreno = true;
      else
        benga.otvoreno = false;
    }

    return time;

  }
}
