import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { LaunchReview } from '@ionic-native/launch-review/ngx';
import { Storage } from '@ionic/storage';

import { Gorivo } from '../benzinska/gorivo';
import { Postaja } from '../benzinska/postaja';


import { BenzinskePostajeService } from '../service/benzinske-postaje.service';

@Component({
  selector: 'app-pocetna',
  templateUrl: './pocetna.page.html',
  styleUrls: ['./pocetna.page.scss'],
})
export class PocetnaPage implements OnInit {

  constructor(private http: HttpClient, 
    private benzinske: BenzinskePostajeService,
    private launchReview: LaunchReview,
    private storage: Storage) { }

  ngOnInit() {
    let localHost = "http://localhost:3000/";
    
    this.benzinske.dohvatiPodatke();
  }


}
