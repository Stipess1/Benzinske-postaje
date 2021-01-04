import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { LaunchReview } from '@ionic-native/launch-review/ngx';
import { Storage } from '@ionic/storage';
import { Benzinska } from '../benzinska/benzinska';
import { Cijenik } from '../benzinska/cijenik';
import { Gorivo } from '../benzinska/gorivo';
import { Postaja } from '../benzinska/postaja';
import { RadnoVrijeme } from '../benzinska/radnovrijeme';
import { Usluge } from '../benzinska/usluge';
import { BenzinskePostajeService } from '../service/benzinske-postaje.service';
import { HakParserService } from '../service/hak-parser.service';

@Component({
  selector: 'app-pocetna',
  templateUrl: './pocetna.page.html',
  styleUrls: ['./pocetna.page.scss'],
})
export class PocetnaPage implements OnInit {

  constructor(private http: HttpClient, 
    private benzinske: BenzinskePostajeService,
    private hakParser: HakParserService,
    private launchReview: LaunchReview,
    private storage: Storage) { }

  ngOnInit() {
    let localHost = "http://localhost:3000/";
    let heroku = "https://benzinske-postaje.herokuapp.com";

    
    // this.http.get('assets/json/gorivo.json').subscribe((data: any) => {

    //   for (let i = 0; i < data['gorivos'].length; i++) {
    //     if(data['gorivos'][i]['naziv'] != null) {
    //       let gorivo = new Gorivo();
    //       gorivo.id = data['gorivos'][i]['id'];
    //       gorivo.naziv = data['gorivos'][i]['naziv'];
    //       gorivo.vrstaGorivaId = data['gorivos'][i]['vrsta_goriva_id'];
          
          
    //       this.benzinske.vrsteGoriva.push(gorivo);
    //     }
    //   }
    //   //console.table(this.benzinske.vrsteGoriva);
      
    // });

    // this.http.get('assets/json/postaje.json').subscribe((data: any) => {

    //   for(let i = 0; i < data['postajas'].length; i++) {
    //     let postaja = data['postajas'][i];
    //     let benzinska = new Benzinska();
    //     let radnoVrijeme = new RadnoVrijeme();

    //     benzinska.lat = postaja['lat'];
    //     benzinska.lon = postaja['long'];
    //     benzinska.adresa = postaja['adresa'];
    //     benzinska.ime = postaja['naziv'];
    //     benzinska.obveznikId = postaja['obveznik_id'];
    //     benzinska.mzoeId = postaja['id'];
    //     benzinska.grad = postaja['mjesto'];
    //     benzinska.radnoVrijeme = radnoVrijeme;
    //     for(let j = 0; j < postaja['radnaVremena'].length; j++) {
    //       let vrijeme = postaja['radnaVremena'][j];
    //       if (vrijeme['vrsta_dana_id'] == 1)
    //         benzinska.radnoVrijeme.ponPet = vrijeme['pocetak'] + "-" + vrijeme['kraj'];
    //       else if (vrijeme['vrsta_dana_id'] == 2) 
    //         benzinska.radnoVrijeme.sub = vrijeme['pocetak'] + "-" + vrijeme['kraj'];
    //       else if (vrijeme['vrsta_dana_id'] == 3) 
    //         benzinska.radnoVrijeme.ned = vrijeme['pocetak'] + "-" + vrijeme['kraj'];
    //       else if (vrijeme['vrsta_dana_id'] == 4) 
    //         benzinska.radnoVrijeme.praznik = vrijeme['pocetak'] + "-" + vrijeme['kraj'];
    //     }
    //     benzinska.trenutnoRadnoVrijeme = this.hakParser.parseTime(benzinska);
        
    //     this.benzinske.sveBenzinske.push(benzinska);
    //   }
    //   this.http.get('assets/json/obveznik.json').subscribe((data: any) =>{
    //     for(let i = 0; i < data['obvezniks'].length; i++) {
    //       let obveznik = data['obvezniks'][i];
    //       for(let j = 0; j < this.benzinske.sveBenzinske.length; j++) {
    //         if(this.benzinske.sveBenzinske[i].obveznikId == obveznik['id']) {
    //           this.benzinske.sveBenzinske[i].kompanija = obveznik['naziv'];
    //         }
    //       }
    //     }
    //   });

    //   this.http.get('assets/json/gorivo.json').subscribe((data: any) => {
    //     for(let i = 0; i < this.benzinske.sveBenzinske.length; i++) {
    //       for(let j = 0; j < data['gorivos'].length; j++) {
    //         if(this.benzinske.sveBenzinske[i].obveznikId == data['gorivos'][j]['obveznik_id']) {
    //           let gorivo = data['gorivos'][j]['vrsta_goriva_id'];
    //           if(gorivo == 8 || gorivo == 7 || gorivo == 2 || gorivo == 1 || gorivo == 5 || gorivo == 6)
    //             this.benzinske.sveBenzinske[i].imaGorivo = true;
    //         }
    //       }
    //     }
    //   });
    // });
    
    this.http.get('https://benzinske-postaje.herokuapp.com').subscribe((data: any) => {
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

          this.benzinske.svePostaje.push(postaja);
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

        this.benzinske.svaGoriva.push(gorivo);
      }
      console.log(this.benzinske.svaGoriva);
      
      this.benzinske.dataLoaded();
    });
    // this.http.get('https://webservis.mzoe-gor.hr/api/trend-cijena ').subscribe((data: any) => {
    //   console.log(data);
      
    // })
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

    let pocetnoVrijeme = splitTime[0].slice(0, splitTime[0].length - 3);
    let zavrsnoVrijeme = splitTime[1].slice(0, splitTime[1].length - 3);

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

}
