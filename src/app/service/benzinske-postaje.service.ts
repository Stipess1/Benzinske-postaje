import { Injectable } from '@angular/core';
import { Gorivo } from '../benzinska/gorivo';
import { HttpClient } from '@angular/common/http';
import { Buffer } from 'buffer';
import { from, Subject } from 'rxjs';
import { Postaja } from '../benzinska/postaja';
import { Cijenik } from '../benzinska/cijenik';
import { Usluge } from '../benzinska/usluge';
import { RadnoVrijeme } from '../benzinska/radnovrijeme';

@Injectable({
  providedIn: 'root'
})
export class BenzinskePostajeService {

  public popover: any;
  public filter: string;
  public trenutnaBenga: Postaja;
  // sa web api
  public svaGoriva: Gorivo[] = [];
  public svePostaje: Postaja[] = [];
  public filterPostaji: Postaja[] = [];
  public trenutnoGorivo: string;
  public loadedData: boolean;
  //
  public lat: number;
  public lon: number;
  public insetBar: string;
  public radius: number = 5;

  // callback tako da znamo kada su se postaje ucitale sa web api-a
  private callback = new Subject<any>();
  callback$ = this.callback.asObservable();

  // https://webservis.mzoe-gor.hr/api/cjenici-postaja/303 za INA cjenik
  // https://webservis.mzoe-gor.hr/api/cjenici-postaja/770 za petrol
  // https://webservis.mzoe-gor.hr/api/cjenici-postaja/40 za tifon
  // https://webservis.mzoe-gor.hr/api/trend-cijena 
  // https://benzinske-postaje.herokuapp.com
  // https://map.hak.hr/?lang=hr&s=mireo;roadmap;mid;I;6;12;0;;1&z=15&c=46.29234680212717,16.467994898557663&cats=3101;3103;3102;3104;3109;3106
  // https://map.hak.hr/?lang=hr&s=mireo;roadmap;mid;I;6;12;0;;1&z=15&c=45.831050387695676,16.101264506578445&cats=3101;3103;3102;3104;3109;3106

  constructor(private httpClient: HttpClient) { }

  tabs(tab: string) {
    let item = document.getElementById('tab-bar');
    let tempTab = tab;
    for(let i = 0; i < 3; i++) {
      item.children[i].children[0].setAttribute('style', "color: #9e9e9e;");
      item.children[i].children[1].setAttribute('style', "font-weight: normal; color: #9e9e9e;");
      if(i == 0) {
        item.children[i].children[0].setAttribute('name', 'home-outline');
      } else if(i == 1){
        item.children[i].children[0].setAttribute('name', 'map-outline');
      } else if(i == 2) {
        item.children[i].children[0].setAttribute('name', 'settings-outline');
      }
    }
    if(tab === "map")
      tempTab = "karta"
    
    document.getElementById("tab-button-"+tempTab).children[0].setAttribute('name',tab)
    document.getElementById("tab-button-"+tempTab).children[1].setAttribute('style', "font-weight: bold; color: #3880ff;");
    document.getElementById("tab-button-"+tempTab).children[0].setAttribute('style', "color: #3880ff;");
  }

  /**
   * pozovemo ovu funkciju kada su se postaje ucitale sa web api-a
   */
  public dataLoaded() {
    this.callback.next();
  }

  dohvatiPodatke() {
    let heroku = "https://benzinske-postaje.herokuapp.com";
    this.svePostaje = [];
    this.httpClient.get(heroku).subscribe((data: any) => {
      // console.log(data["postajas"]);
      for(let i = 0; i < data["postajas"].length; i++) {
          let postaja = new Postaja();
          let web = data["postajas"][i];

          postaja.adresa = web["adresa"].replace(/\u00A0/, " ");
          postaja.id = web['id'];
          postaja.lat = web['lat'];
          postaja.long = web['long'];
          postaja.mjesto = web['mjesto'].replace(/\u00A0/, " ");
          postaja.naziv = web['naziv'].replace(/\u00A0/, " ");
          postaja.obveznikId = web['obveznik_id'];

          // dali postoji dizel bez aditiva
          let postojiDizel8 = false;
          for(let j = 0; j < web['cjenici'].length; j++) {
            let gorivo = new Cijenik();
            gorivo.id = web['cjenici'][j]['id'];
            gorivo.gorivo_id = web['cjenici'][j]['gorivo_id'];
            gorivo.cijena = web['cjenici'][j]['cijena'];
            this.getNaziv(gorivo, data['gorivos']);
            if(gorivo.vrstaGorivaId === 8) {
              postojiDizel8 = true;
              postaja.gorivo = gorivo.cijena.toFixed(2);
            }
              
            postaja.cijenici.push(gorivo);
          }

          if(!postojiDizel8) {
            for(let j = 0; j < postaja.cijenici.length; j++) {
              if(postaja.cijenici[j].vrstaGorivaId === 7) {
                postaja.gorivo = postaja.cijenici[j].cijena.toFixed(2);
                break;
              }
            }
            if(postaja.gorivo === undefined)
              postaja.gorivo = "---";
          }
            

          for(let j = 0; j < web['opcije'].length; j++){
            postaja.opcije.push(new Usluge(web['opcije'][j]['opcija_id']));
          }

          let radnoVrijeme = new RadnoVrijeme();
          for(let j = 0; j < web['radnaVremena'].length; j++) {
            
            let vrijeme = web['radnaVremena'][j];

            if(vrijeme['vrsta_dana_id'] == 1) {
              radnoVrijeme.ponPet = this.parseTime(vrijeme['pocetak']+'-'+vrijeme['kraj'], postaja, null);
            } else if(vrijeme['vrsta_dana_id'] == 2) {
              radnoVrijeme.sub = this.parseTime(vrijeme['pocetak']+'-'+vrijeme['kraj'], postaja, null);
            } else if(vrijeme['vrsta_dana_id'] == 3) {
              radnoVrijeme.ned = this.parseTime(vrijeme['pocetak']+'-'+vrijeme['kraj'], postaja, null);
            } else if((vrijeme['vrsta_dana_id'] == 4)){
              radnoVrijeme.praznik = this.parseTime(vrijeme['pocetak']+'-'+vrijeme['kraj'], postaja, null);
            }
            
          }

          postaja.radnaVremena = radnoVrijeme;
          postaja.trenutnoRadnoVrijeme = this.parseTime(undefined, postaja, radnoVrijeme);
          for(let j = 0; j < data['obvezniks'].length; j++) {
            if(data['obvezniks'][j]['id'] === postaja.obveznikId) {
              postaja.obveznik = data['obvezniks'][j]['naziv'];
              postaja.img = "https://webservis.mzoe-gor.hr/img/" + data['obvezniks'][j]['logo'];
            }
          }

          if (postaja.obveznik.includes("Konzum")) {
            postaja.img = "https://www.konzum.hr/assets/1i0/frontend/facebook/facebook_meta_image-5b88c5da1a557eaf6501d1fb63f883285f9346300d9b2e0a196dc32047a9542a.png";
          } else if (postaja.obveznik.includes("AGS")) {
            postaja.img = "/assets/icon/pump/ags.png";
          } 

          this.svePostaje.push(postaja);
      }
      // -console.log(this.benzinske.svePostaje);
      
      for(let i = 0; i < data['gorivos'].length; i++) {
        let gorivo = new Gorivo();
        let web = data['gorivos'][i];

        gorivo.id = web['id'];
        if(web['naziv'] != null)
          gorivo.naziv = web['naziv'].replace(/\u00A0/, " ");
        gorivo.obveznik_id = web['obveznik_id'];
        gorivo.vrstaGorivaId = web['vrsta_goriva_id'];

        this.svaGoriva.push(gorivo);
      }
      
      this.dataLoaded();
    });
  }

  getNaziv(cijenik: Cijenik, data: any) {
    for(let i = 0; i < data.length; i++) {
        if(cijenik.gorivo_id === data[i]['id']) {
          cijenik.naziv = data[i]['naziv'];
          cijenik.vrstaGorivaId = data[i]['vrsta_goriva_id'];
          break;
        }
    }
  }

  
    /**
   * Prima radno vrijeme benzinske (npr. 00:00:00-24:00:00 ), te skracuje
   * zadnje dvije nule i provjerava dali je benzinska trenutno otvorena
   * za odredene benzinske nema radnog vremena za neke dane pa je {vrijeme}
   * undefined
   * @param {Postaja} postaja - Postaja koju trenutno parsamo
   * @param {string} benga - vrijeme koje parsamo
   * @param {RadnoVrijeme} radnoVrijeme - ako je != null onda dohvacamo trenutno radno vrijeme postaje
   * @returns {string} - vraca radno vrijeme benzinske (npr. 06:00 - 24:00)
   */
  parseTime(benga: string, postaja: Postaja, radnoVrijeme: RadnoVrijeme) {


    let vrijeme = benga;
    let date = new Date();

    if(radnoVrijeme != null) {
      if (date.getDay() >= 1 && date.getDay() <= 5) {

        return radnoVrijeme.ponPet;
  
      } else if (date.getDay() == 0) {
  
        return radnoVrijeme.ned;
  
      } else if (date.getDay() == 6) {
        return radnoVrijeme.sub;
      }
    }

    if (vrijeme == undefined) return;

    let splitTime = vrijeme.split("-");

    if (splitTime[0].length == 8) {
      splitTime[0] = splitTime[0].slice(0, splitTime[0].length - 3);
    }

    splitTime[1] = splitTime[1].slice(0, splitTime[1].length - 3);

    let time = splitTime[0] + "-" + splitTime[1];

    let pocetnoVrijeme = splitTime[0].slice(0, splitTime[0].length - 3); // 6
    let zavrsnoVrijeme = splitTime[1].slice(0, splitTime[1].length - 3); // 20
    
    // if(parseInt(pocetnoVrijeme) == 6 && parseInt(zavrsnoVrijeme) == 22) {
    //   console.log(parseInt(pocetnoVrijeme) + ' ' + parseInt(zavrsnoVrijeme));
    //   console.log(date.getHours() < parseInt(zavrsnoVrijeme) && date.getHours() > parseInt(pocetnoVrijeme));
    // }
      
    if (date.getHours() < parseInt(zavrsnoVrijeme) && date.getHours() > parseInt(pocetnoVrijeme)) {
      postaja.otvoreno = true;
    } else {
      if (zavrsnoVrijeme === "24" && pocetnoVrijeme == "00")
        postaja.otvoreno = true;
      else
        postaja.otvoreno = false;
    }

    return time;

  }

  getCijenik(id: string) {
    return this.httpClient.get("https://webservis.mzoe-gor.hr/api/cjenici-postaja/" + id);
  }


  getTrend() {
    return this.httpClient.get('https://webservis.mzoe-gor.hr/api/trend-cijena');
  }

  // izracunaj udaljenost izmedu dva gps kordinata (zracna udaljenost)
  calculateDistance(lat1: number, lon1: number) {
    let p = 0.017453292519943295; 
    let c = Math.cos;
    let a = 0.5 - c((lat1 - this.lat) * p) / 2 +
      c(this.lat * p) * c(lat1 * p) *
      (1 - c((lon1 - this.lon) * p)) / 2;

    return 12742 * Math.asin(Math.sqrt(a));
  }

  // getCordsOfCity(search: Search) {
  //   console.log("search: " + search.postanski + " " + search.grad);
  //   return this.httpClient.get('https://nominatim.openstreetmap.org/search?postalcode=' + search.postanski + '&city=' + search.grad + '&addressdetails=1&country=Croatia&format=json');
  // }

}



