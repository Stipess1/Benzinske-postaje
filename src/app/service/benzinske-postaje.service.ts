import { Injectable } from '@angular/core';
import { Gorivo } from '../benzinska/gorivo';
import { HttpClient } from '@angular/common/http';
import { Buffer } from 'buffer';
import { from, Subject } from 'rxjs';
import { Postaja } from '../benzinska/postaja';

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

  // demo() {
  //   let redirectPath = "https://benzinske-postaje.herokuapp.com/";
    
  //   return from(this.http.get(redirectPath, {}, {
  //     "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.122 Safari/537.36",
  //     "Content-Type": "application/json",
  //     "Accept-Encoding": "gzip, deflate"
  //   }));
  // }

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



