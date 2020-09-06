import { Injectable } from '@angular/core';
import { HTTP } from '@ionic-native/http/ngx';
import { Search } from '../search/model/search';
import { Benzinska } from '../benzinska/benzinska';

@Injectable({
  providedIn: 'root'
})
export class BenzinskePostajeService {

  private URL: string = "https://map.hak.hr/?lang=hr&s=mireo;roadmap;mid;I;6;12;0;;1&z=7&c=44.56145769902792,17.116508781909943&cats=3101;3103;3102;3104;3109;3106&poi=";
  public trenutniGrad: Search;
  public trenutniTekst: string = "";
  public popover: any;
  public filter: string;
  public filterBenga: Benzinska[] = [];
  public trenutnaBenga: Benzinska;
  public lat: number;
  public lon: number;

  // https://webservis.mzoe-gor.hr/api/cjenici-postaja/303 za INA cjenik
  // https://webservis.mzoe-gor.hr/api/cjenici-postaja/770 za petrol
  // https://webservis.mzoe-gor.hr/api/cjenici-postaja/40 za tifon
  // https://webservis.mzoe-gor.hr/api/trend-cijena 
  // https://map.hak.hr/?lang=hr&s=mireo;roadmap;mid;I;6;12;0;;1&z=15&c=46.29234680212717,16.467994898557663&cats=3101;3103;3102;3104;3109;3106
  // https://map.hak.hr/?lang=hr&s=mireo;roadmap;mid;I;6;12;0;;1&z=15&c=45.831050387695676,16.101264506578445&cats=3101;3103;3102;3104;3109;3106

  constructor(private http: HTTP) { }

  // vraca podakte o benzinskoj
  getPumpData(id: string) {
    return this.http.get("https://map.hak.hr/api/rest/3.2/poi/details/?id=B"+id+"&token=6d230bddaf3fbc&output=json", {}, {
    "Host": "map.hak.hr",
    "Referer": "https://map.hak.hr/?lang=hr&s=mireo;roadmap;mid;I;6;12;0;;1&z=7&c=44.589799591933456,16.360918432474136&cats=3101;3103;3102;3104;3109;3106&poi=B"+id});
  }

  // vraca podatke od svih benzinskih pumpi
  getData() {
    return this.http.get("https://map.hak.hr/api/rest/3.2/poi/bounds/?ll1=39.80598516794013,10.163631588220596&ll2=47.24715287606429,20.864315181970596&catids=3101,3103,3102,3104,3109,3106&token=6d230bddaf3fbc&output=json"
    ,{} ,{"Referer": "https://map.hak.hr/?lang=hr&s=mireo;roadmap;mid;I;6;12;0;;1&z=7&c=45.463594034145046,11.02216511964798&cats=3101;3103;3102;3104;3109;3106"});
  }

  getCijenik(id: string) {
    return this.http.get("https://webservis.mzoe-gor.hr/api/cjenici-postaja/"+id, {}, {})
  }

  getQuery(text: string) {
    return this.http.get('https://mapsrv.hak.hr/hr?callback=_jqjsp&fun=search&q='+ text +'&lng=0&lat=0&_1587771304138=', {}, {
      "Referer" : "https://map.hak.hr/?lang=hr&s=mireo;roadmap;mid;I;6;12;0;;1&z=13&c=45.77703541407042,16.048721373081207&cats=3101;3103;3102;3104;3109;3106",
      "Host" : "mapsrv.hak.hr"
    });
  }

  // izracunaj udaljenost izmedu dva gps kordinata (zracna udaljenost)
  calculateDistance(lat1: number, lon1: number) {
    let p = 0.017453292519943295;    // Math.PI / 180
    let c = Math.cos;
    let a = 0.5 - c((lat1 - this.lat) * p)/2 + 
            c(this.lat * p) * c(lat1 * p) * 
            (1 - c((lon1 - this.lon) * p))/2;

    return 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
  }

  getCordsOfCity(search: Search) {
    console.log("search: " + search.postanski + " " + search.grad);
    
    return this.http.get('https://nominatim.openstreetmap.org/search?postalcode='+search.postanski+'&city='+search.grad+'&addressdetails=1&country=Croatia&format=json', {}, {});
  }

  // getZip() {
    
  //   return this.http.get("https://mzoe-gor.hr/data.gz", {}, {"Accept": "*/*",
  //   "Accept-Encoding": "gzip, deflate, br",
  //   "Accept-Language": "2hr-HR,hr;q=0.9,en-US;q=0.8,en;q=0.7",
  //   "Connection": "keep-alive",
  //   "Cookie": "_ga=GA1.2.1827149009.1587500969; _gid=GA1.2.1310024045.1587500969",
  //   "Host": "mzoe-gor.hr",
  //   "If-None-Match": "3f667-5a3f19dfecd36",
  //   "Referer": "https//mzoe-gor.hr/",
  //   "Sec-Fetch-Dest": "empty",
  //   "Sec-Fetch-Mode": "cors",
  //   "Sec-Fetch-Site": "same-origin",
  //   "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.122 Safari/537.36"});
  // }


}
