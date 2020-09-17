import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
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
    private hakParser: HakParserService) { }

  ngOnInit() {
    console.log(console);
    
    this.http.get('assets/json/gorivo.json').subscribe((data: any) => {

      console.log(data['gorivos'].length);
      for (let i = 0; i < data['gorivos'].length; i++) {
        let gorivo = new Gorivo();
        gorivo.id = data['gorivos'][i]['id'];
        gorivo.naziv = data['gorivos'][i]['naziv'];
        gorivo.vrstaGorivaId = data['gorivos'][i]['vrsta_goriva_id'];
        this.benzinske.vrsteGoriva.push(gorivo);
      }
     
      
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
        benzinska.radnoVrijeme.ponPet = postaja['radnaVremena'][0]['pocetak'] + "-" + postaja['radnaVremena'][0]['kraj'];
        
        if(postaja['radnaVremena'].length > 2) {
          benzinska.radnoVrijeme.sub = postaja['radnaVremena'][1]['pocetak'] + "-" + postaja['radnaVremena'][1]['kraj'];
          benzinska.radnoVrijeme.ned = postaja['radnaVremena'][2]['pocetak'] + "-" + postaja['radnaVremena'][2]['kraj'];
          if(postaja['radnaVremena'][3] != undefined) {
            benzinska.radnoVrijeme.praznik = postaja['radnaVremena'][3]['pocetak'] + "-" + postaja['radnaVremena'][3]['kraj'];
          }
        }
        benzinska.trenutnoRadnoVrijeme = this.hakParser.parseTime(benzinska);
        
        this.benzinske.sveBenzinske.push(benzinska);
      }
      console.table(this.benzinske.sveBenzinske);
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

    });
  }

}
