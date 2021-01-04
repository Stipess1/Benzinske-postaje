import { Injectable } from '@angular/core';
import { HTTP, HTTPResponse } from '@ionic-native/http/ngx';
import { Search } from '../search/model/search';
import { Benzinska } from '../benzinska/benzinska';
import { Gorivo } from '../benzinska/gorivo';
import { HttpClient } from '@angular/common/http';
import { Buffer } from 'buffer';
import { BenzinskaOsnovni } from '../benzinska/benzinskaOsnovni';
import { from, Subject } from 'rxjs';
import { Postaja } from '../benzinska/postaja';

@Injectable({
  providedIn: 'root'
})
export class BenzinskePostajeService {

  private URL: string = "https://map.hak.hr/?lang=hr&s=mireo;roadmap;mid;I;6;12;0;;1&z=7&c=44.56145769902792,17.116508781909943&cats=3101;3103;3102;3104;3109;3106&poi=";
  public trenutniGrad: Search;
  public trenutniTekst: string = "";
  public popover: any;
  public filter: string;
  public sveBenzinske: Benzinska[] = [];
  public filterBenga: Benzinska[] = [];
  public hakBenzinske: BenzinskaOsnovni[] = [];
  public trenutnaBenga: Postaja;
  // sa web api
  public svaGoriva: Gorivo[] = [];
  public svePostaje: Postaja[] = [];
  public filterPostaji: Postaja[] = [];
  public ucitano: boolean = false;
  //
  public lat: number;
  public lon: number;
  public insetBar: string;
  public vrsteGoriva: Gorivo[] = [];
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

  constructor(private http: HTTP, private httpClient: HttpClient) { }

  // vraca podakte o benzinskoj
  getPumpData(id: string) {
    return this.http.get("https://map.hak.hr/api/rest/3.2/poi/details/?id=B" + id + "&token=6d230bddaf3fbc&output=json", {}, {
      "Host": "map.hak.hr",
      "Referer": "https://map.hak.hr/?lang=hr&s=mireo;roadmap;mid;I;6;12;0;;1&z=7&c=44.589799591933456,16.360918432474136&cats=3101;3103;3102;3104;3109;3106&poi=B" + id
    });
  }

  tabs(tab: string) {
    let item = document.getElementById('tab-bar');
    let tempTab = tab;
    for(let i = 0; i < 2; i++) {
      item.children[i].children[0].setAttribute('style', "color: #9e9e9e;");
      item.children[i].children[1].setAttribute('style', "font-weight: normal; color: #9e9e9e;");
      if(i == 0) {
        item.children[i].children[0].setAttribute('name', 'home-outline');
      } else {
        item.children[i].children[0].setAttribute('name', 'map-outline');
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

  // vraca podatke od svih benzinskih pumpi
  getData() {
    return this.http.get("https://map.hak.hr/api/rest/3.2/poi/bounds/?ll1=39.80598516794013,10.163631588220596&ll2=47.24715287606429,20.864315181970596&catids=3101,3103,3102,3104,3109,3106&token=6d230bddaf3fbc&output=json"
      , {}, { "Referer": "https://map.hak.hr/?lang=hr&s=mireo;roadmap;mid;I;6;12;0;;1&z=7&c=45.463594034145046,11.02216511964798&cats=3101;3103;3102;3104;3109;3106" });
  }

  getCijenik(id: string) {
    return this.httpClient.get("https://webservis.mzoe-gor.hr/api/cjenici-postaja/" + id);
  }

  getQuery(text: string) {
    return this.http.get('https://mapsrv.hak.hr/hr?callback=_jqjsp&fun=search&q=' + text + '&lng=0&lat=0&_1587771304138=', {}, {
      "Referer": "https://map.hak.hr/?lang=hr&s=mireo;roadmap;mid;I;6;12;0;;1&z=13&c=45.77703541407042,16.048721373081207&cats=3101;3103;3102;3104;3109;3106",
      "Host": "mapsrv.hak.hr"
    });
  }

  /*
    id 1 - benzinsko
    id 2 - dizel
    id 3 - autoplin
    id 4 - plinsko ulje
  */
  getTrend() {
    return this.http.get('https://webservis.mzoe-gor.hr/api/trend-cijena', {}, {});
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

  getCordsOfCity(search: Search) {
    console.log("search: " + search.postanski + " " + search.grad);
    return this.http.get('https://nominatim.openstreetmap.org/search?postalcode=' + search.postanski + '&city=' + search.grad + '&addressdetails=1&country=Croatia&format=json', {}, {});
  }

}



