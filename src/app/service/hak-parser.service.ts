import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HTTP } from '@ionic-native/http/ngx';
import { Platform } from '@ionic/angular';
import { Benzinska } from '../benzinska/benzinska';
import { BenzinskaOsnovni } from '../benzinska/benzinskaOsnovni';
import { GorivoHak } from '../benzinska/gorivoHak';
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
            let benga = new Benzinska();

            benga.lat = benz.lat;
            benga.lon = benz.lon;
            let radnoVrijeme = new RadnoVrijeme();
            let slika = doc.getElementsByClassName("iw-top__icon")[0].querySelectorAll('img')[0].src;

            let grad = doc.getElementsByClassName("iw-section")[3].getElementsByClassName("iw-row")[1].getElementsByClassName("iw-value")[0].innerHTML;
            let adresa = doc.getElementsByClassName("iw-section")[3].getElementsByClassName("iw-row")[0].getElementsByClassName("iw-value")[0].innerHTML;
            let vrijeme = doc.getElementById("rv").getElementsByClassName("iw-row");

            if (vrijeme.length == 3) {
              radnoVrijeme.ponPet = vrijeme[0].getElementsByClassName("iw-col--right")[0].innerHTML;
              if (vrijeme[1].getElementsByClassName("iw-col--left")[0].innerHTML === "Subota")
                radnoVrijeme.sub = vrijeme[1].getElementsByClassName("iw-col--right")[0].innerHTML;
              else if (vrijeme[1].getElementsByClassName("iw-col--left")[0].innerHTML === "Nedjelja")
                radnoVrijeme.ned = vrijeme[1].getElementsByClassName("iw-col--right")[0].innerHTML;

              if (vrijeme[2].getElementsByClassName("iw-col--left")[0].innerHTML == "Praznik")
                radnoVrijeme.praznik = vrijeme[2].getElementsByClassName("iw-col--right")[0].innerHTML;
            } else if (vrijeme.length == 2) {
              radnoVrijeme.ponPet = vrijeme[0].getElementsByClassName("iw-col--right")[0].innerHTML;
              if (vrijeme[1].getElementsByClassName("iw-col--left")[0].innerHTML === "Subota")
                radnoVrijeme.sub = vrijeme[1].getElementsByClassName("iw-col--right")[0].innerHTML;
              else if (vrijeme[1].getElementsByClassName("iw-col--left")[0].innerHTML === "Nedjelja")
                radnoVrijeme.ned = vrijeme[1].getElementsByClassName("iw-col--right")[0].innerHTML;
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
              let gorivo = new GorivoHak();
              gorivo.imeGoriva = split[0].replace(/&nbsp;/g, " ");
              gorivo.cijena = split[1].slice(0, -5);
              benga.vrsteGoriva.push(gorivo);
            }
            let imaGorivo = false;

            for (let i = 0; i < this.benzinske.vrsteGoriva.length; i++) {

              let lower = this.benzinske.vrsteGoriva[i].naziv.toLowerCase().replace(/ /g, "");
              for (let j = 0; j < benga.vrsteGoriva.length; j++) {
                let vrstaLower = benga.vrsteGoriva[j].imeGoriva.toLowerCase().replace(/ /g, "");
                if (lower === vrstaLower) {
                  benga.vrsteGoriva[j].vrstaGorivaId = this.benzinske.vrsteGoriva[i].vrstaGorivaId;
                }
              }
            }

            // dizel bez aditiva
            if (this.trenutnoGorivo == "DIZELA") {
              for (let i = 0; i < this.benzinske.vrsteGoriva.length; i++) {

                let lower = this.benzinske.vrsteGoriva[i].naziv.toLowerCase().replace(/ /g, "");
                for (let j = 0; j < benga.vrsteGoriva.length; j++) {
                  let vrstaLower = benga.vrsteGoriva[j].imeGoriva.toLowerCase().replace(/ /g, "");
                  if (lower === vrstaLower && (this.benzinske.vrsteGoriva[i].vrstaGorivaId == 8 || this.benzinske.vrsteGoriva[i].vrstaGorivaId == 7)) {
                    benga.gorivo = benga.vrsteGoriva[j].cijena;
                    imaGorivo = true;
                  }
                }
              }
            } else if (this.trenutnoGorivo == "BENZINA") {
              for (let i = 0; i < this.benzinske.vrsteGoriva.length; i++) {

                let lower = this.benzinske.vrsteGoriva[i].naziv.toLowerCase().replace(/ /g, "");
                for (let j = 0; j < benga.vrsteGoriva.length; j++) {
                  let vrstaLower = benga.vrsteGoriva[j].imeGoriva.toLowerCase().replace(/ /g, "");
                  if (lower === vrstaLower && this.benzinske.vrsteGoriva[i].vrstaGorivaId == 2) {
                    benga.gorivo = benga.vrsteGoriva[j].cijena;
                    imaGorivo = true;
                  }
                }
              }
            } else if (this.trenutnoGorivo == "AUTOPLIN") {
              for (let i = 0; i < this.benzinske.vrsteGoriva.length; i++) {

                let lower = this.benzinske.vrsteGoriva[i].naziv.toLowerCase().replace(/ /g, "");
                for (let j = 0; j < benga.vrsteGoriva.length; j++) {
                  let vrstaLower = benga.vrsteGoriva[j].imeGoriva.toLowerCase().replace(/ /g, "");
                  if (lower === vrstaLower && this.benzinske.vrsteGoriva[i].vrstaGorivaId == 9) {
                    benga.gorivo = benga.vrsteGoriva[j].cijena;
                    benga.vrsteGoriva[j].vrstaGorivaId = 9;
                    imaGorivo = true;
                  }
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
            // benga.vrsteGoriva = vrstaGorivaArray;
            benga.id = benz.id.substr(1);

            benga.imaGorivo = imaGorivo;
            benga.udaljenost = benz.udaljenost;

            for (let i = 0; i < this.benzinske.sveBenzinske.length; i++) {
              if (this.benzinske.sveBenzinske[i].adresa == benga.adresa && this.benzinske.sveBenzinske[i].ime === benga.ime) {
                benga.mzoeId = this.benzinske.sveBenzinske[i].mzoeId;
                break;
              }
            }

            if (usluge != undefined)
              benga.usluge = listaUsluga;

            benga.trenutnoRadnoVrijeme = this.parseTime(benga);

            resolve(benga);

            // if (imaGorivo) 
            //   resolve(benga);
            // else
            //   reject("Nema goriva id: " + benga.id);

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
