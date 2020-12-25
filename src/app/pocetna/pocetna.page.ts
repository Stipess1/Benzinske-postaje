import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { LaunchReview } from '@ionic-native/launch-review/ngx';
import { Storage } from '@ionic/storage';
import { Benzinska } from '../benzinska/benzinska';
import { Gorivo } from '../benzinska/gorivo';
import { RadnoVrijeme } from '../benzinska/radnovrijeme';
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

    
    this.http.get('assets/json/gorivo.json').subscribe((data: any) => {

      for (let i = 0; i < data['gorivos'].length; i++) {
        if(data['gorivos'][i]['naziv'] != null) {
          let gorivo = new Gorivo();
          gorivo.id = data['gorivos'][i]['id'];
          gorivo.naziv = data['gorivos'][i]['naziv'];
          gorivo.vrstaGorivaId = data['gorivos'][i]['vrsta_goriva_id'];
          
          
          this.benzinske.vrsteGoriva.push(gorivo);
        }
      }
      //console.table(this.benzinske.vrsteGoriva);
      
    });
    this.http.get('assets/json/postaje.json').subscribe((data: any) => {

      for(let i = 0; i < data['postajas'].length; i++) {
        let postaja = data['postajas'][i];
        let benzinska = new Benzinska();
        let radnoVrijeme = new RadnoVrijeme();

        benzinska.lat = postaja['lat'];
        benzinska.lon = postaja['long'];
        benzinska.adresa = postaja['adresa'];
        benzinska.ime = postaja['naziv'];
        benzinska.obveznikId = postaja['obveznik_id'];
        benzinska.mzoeId = postaja['id'];
        benzinska.grad = postaja['mjesto'];
        benzinska.radnoVrijeme = radnoVrijeme;
        for(let j = 0; j < postaja['radnaVremena'].length; j++) {
          let vrijeme = postaja['radnaVremena'][j];
          if (vrijeme['vrsta_dana_id'] == 1)
            benzinska.radnoVrijeme.ponPet = vrijeme['pocetak'] + "-" + vrijeme['kraj'];
          else if (vrijeme['vrsta_dana_id'] == 2) 
            benzinska.radnoVrijeme.sub = vrijeme['pocetak'] + "-" + vrijeme['kraj'];
          else if (vrijeme['vrsta_dana_id'] == 3) 
            benzinska.radnoVrijeme.ned = vrijeme['pocetak'] + "-" + vrijeme['kraj'];
          else if (vrijeme['vrsta_dana_id'] == 4) 
            benzinska.radnoVrijeme.praznik = vrijeme['pocetak'] + "-" + vrijeme['kraj'];
        }
        benzinska.trenutnoRadnoVrijeme = this.hakParser.parseTime(benzinska);
        
        this.benzinske.sveBenzinske.push(benzinska);
      }
      this.http.get('assets/json/obveznik.json').subscribe((data: any) =>{
        for(let i = 0; i < data['obvezniks'].length; i++) {
          let obveznik = data['obvezniks'][i];
          for(let j = 0; j < this.benzinske.sveBenzinske.length; j++) {
            if(this.benzinske.sveBenzinske[i].obveznikId == obveznik['id']) {
              this.benzinske.sveBenzinske[i].kompanija = obveznik['naziv'];
            }
          }
        }
      });

      this.http.get('assets/json/gorivo.json').subscribe((data: any) => {
        for(let i = 0; i < this.benzinske.sveBenzinske.length; i++) {
          for(let j = 0; j < data['gorivos'].length; j++) {
            if(this.benzinske.sveBenzinske[i].obveznikId == data['gorivos'][j]['obveznik_id']) {
              let gorivo = data['gorivos'][j]['vrsta_goriva_id'];
              if(gorivo == 8 || gorivo == 7 || gorivo == 2 || gorivo == 1 || gorivo == 5 || gorivo == 6)
                this.benzinske.sveBenzinske[i].imaGorivo = true;
            }
          }
        }
      });
    });
  }

}
