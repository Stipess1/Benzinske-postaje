import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { HTTP } from '@ionic-native/http/ngx';
import { RadnoVrijeme } from '../benzinska/radnovrijeme';
import { Benzinska } from '../benzinska/benzinska';
import { BenzinskePostajeService } from '../service/benzinske-postaje.service';
import { BenzinskaOsnovni } from '../benzinska/benzinskaOsnovni';
import { Platform, ToastController, PopoverController, AnimationController } from '@ionic/angular';
import { Search } from '../search/model/search';
import { PopoverComponent } from '../popover/popover.component';
import { ActivatedRoute, Router } from '@angular/router';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Usluge } from '../benzinska/usluge';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { Diagnostic } from '@ionic-native/diagnostic/ngx';
import { Gorivo } from '../benzinska/gorivo';
import { HakParserService } from '../service/hak-parser.service';
import { BackgroundMode } from '@ionic-native/background-mode/ngx';
import { GorivoHak } from '../benzinska/gorivoHak';
import { LaunchReview } from '@ionic-native/launch-review/ngx';
import { Postaja } from '../benzinska/postaja';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {

  private benge: Benzinska[] = [];
  public jsonBenge: BenzinskaOsnovni[] = [];
  public searching: boolean = false;
  public gradovi: Search[] = [];
  public permission: boolean;
  public reloading: boolean = false;
  public grad: string = "blizini";
  public subscription: any;
  // -
  // https://nominatim.org/release-docs/develop/api/Search/

  constructor(
    private httpNative: HTTP,
    private http: HttpClient,
    public benzinske: BenzinskePostajeService,
    private platform: Platform,
    private toastController: ToastController,
    private popoverController: PopoverController,
    private router: Router,
    private route: ActivatedRoute,
    private statusBar: StatusBar,
    private geolocation: Geolocation,
    private androidPermissions: AndroidPermissions,
    private diagnostic: Diagnostic,
    private animationController: AnimationController,
    public hakParser: HakParserService,
    private backgroundMode: BackgroundMode,
    private launchReview: LaunchReview) { }

  ngOnInit() {

    this.benzinske.callback$.subscribe(() => {

      console.log("postaje ucitane");
      this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.ACCESS_COARSE_LOCATION).then(
        result => {
          console.log('Has permission?', result.hasPermission);
          this.permission = result.hasPermission;
        });

      this.androidPermissions.requestPermissions([this.androidPermissions.PERMISSION.ACCESS_COARSE_LOCATION, this.androidPermissions.PERMISSION.ACCESS_FINE_LOCATION]).then(
        data => {

          if (data.hasPermission) {
            this.diagnostic.isGpsLocationEnabled().then((gps) => {
              if (gps)
                this.geolocation.getCurrentPosition().then((resp) => {

                  this.benzinske.lat = resp.coords.latitude;
                  this.benzinske.lon = resp.coords.longitude;

                  for(let i = 0; i < this.benzinske.svePostaje.length; i++) {
                    let postaja = this.benzinske.svePostaje[i];
            
                    postaja.udaljenost = this.benzinske.calculateDistance(postaja.long, postaja.lat);
                    postaja.udaljenost = Math.round(postaja.udaljenost * 10) / 10
                    if(postaja.udaljenost <= 5) {
                      this.benzinske.filterPostaji.push(postaja);
                    }
                  }
                  this.hakParser.loadedData = true;

                  if(this.launchReview.isRatingSupported) {
                    console.log("rating");
                    setTimeout(status => {
                      this.launchReview.rating().subscribe(res => {
                        console.log(res);
                      });
                    },100)
                  }

                }).catch(err => {
                  console.log("err: " + err);

                });
              else
                this.presentToast();
            })

          } else {
            console.log("Nema Permission");
          }
        }
      );
      if(!this.platform.is('cordova')) {
        this.benzinske.lat = 45.8285372;
        this.benzinske.lon = 16.1101218;

        for(let i = 0; i < this.benzinske.svePostaje.length; i++) {
          let postaja = this.benzinske.svePostaje[i];
  
          postaja.udaljenost = this.benzinske.calculateDistance(postaja.long, postaja.lat);
          postaja.udaljenost = Math.round(postaja.udaljenost * 10) / 10
          if(postaja.udaljenost <= 5) {
            this.benzinske.filterPostaji.push(postaja);
          }
        }
        this.hakParser.loadedData = true;
      }

    });

    this.hakParser.trenutnoGorivo = "DIZELA"; 
    this.platform.ready().then(data => {


    });
  }

  async presentToast() {
    const toast = await this.toastController.create({
      message: "GPS je isključen, upalite GPS.",
      duration: 2000
    });
    toast.present();
  }


  ionViewWillEnter() {
    console.log("will enter");
    this.subscription = this.platform.backButton.subscribeWithPriority(0, () => {
      this.backgroundMode.moveToBackground();
    });
    this.benzinske.tabs('home');
    document.getElementById('fuel').style.marginTop = this.benzinske.insetBar + "px";
    this.statusBar.backgroundColorByHexString('#ffffff');
  }
  ionViewDidEnter() {
    console.log("did enter");

    const animation = this.animationController.create().addElement(document.getElementById('home')).iterations(1).duration(500).fromTo('opacity', 0, 1);
    animation.play();
  }

  onInput() {
    this.searching = true;
  }

  change(event: any) {
    let query = event.target.value;

    // if (query.length > 0) {
    //   this.gradovi = [];
    //   this.benzinske.getQuery(query).then(data => {
    //     let json = data.data;

    //     json = json.substr(7, json.length - 8);
    //     json = JSON.parse(json);

    //     let loop = 10;

    //     if (json.length < loop) loop = json.length;

    //     for (let i = 0; i < loop; i++) {
    //       let search = new Search();

    //       search.postanski = json[i]['PLZ'];
    //       search.mjesto = json[i]['area'];
    //       search.grad = json[i]['city'];
    //       search.naselje = json[i]['street'];

    //       this.gradovi.push(search);
    //     }
    //   });
    // }

  }

  focus() {
    this.searching = true;
  }

  clear() {
    this.benzinske.trenutniGrad = undefined;
    this.benzinske.trenutniTekst = "";
  }

  cancel() {
    this.searching = false;
  }

  setGrad(grad: Search) {
    this.benzinske.trenutniGrad = grad;
    if (grad.naselje != '')
      this.benzinske.trenutniTekst = grad.naselje + ", " + grad.grad;
    else
      this.benzinske.trenutniTekst = grad.grad;

    console.log(grad.grad);
    let split;
    if (grad.grad.includes(",")) {
      split = grad.grad.split(",");
      grad.grad = split[0];
    }

    this.benzinske.getCordsOfCity(grad).then(resp => {
      let json = JSON.parse(resp.data);
      console.log(json);

      let lat = json[0]['lat'];
      let lon = json[0]['lon'];

      this.benzinske.lat = lat;
      this.benzinske.lon = lon;

      console.log("lat: " + lat + " lon: " + lon + " grad: " + grad.grad);
      this.radius("");
    });
    this.searching = false;
  }

  imgNotLoaded(benga: Benzinska) {
    benga.img = "../assets/icon/icon2.png";
  }

  radius(event: any) {
    let value;
    if(event !== "") {
      value = event.target.value;
      this.benzinske.radius = value;
    }
    else
      value = this.benzinske.radius;


    this.benzinske.filterPostaji = [];
    this.hakParser.loadedData = false;

    this.geolocation.getCurrentPosition().then((resp) => {

      if(event !== "") {
        this.benzinske.lat = resp.coords.latitude;
        this.benzinske.lon = resp.coords.longitude;
      }

      for (let i = 0; i < this.benzinske.svePostaje.length; i++) {
        let benga = this.benzinske.svePostaje[i];
        let udaljenost = this.benzinske.calculateDistance(benga.lat, benga.long);
        udaljenost = Math.round(udaljenost * 10) / 10

        if (benga.udaljenost <= value) {
            this.benzinske.filterPostaji.push(benga);
        }

      }
      this.hakParser.loadedData = true;
    }).catch(err => {
      console.log("err: " + err);

    });

  }

  init() {

    this.benzinske.getData().then(data => {
      let json = JSON.parse(data.data);

      for (let i = 0; i < json.length; i++) {
        let benga = new BenzinskaOsnovni();
        benga.id = json[i]['PoiID'];

        benga.mjesto = json[i]['Alias'];

        benga.ime = json[i]['CategoryName'];


        if (benga.ime == "ostale benzinske postaje")
          benga.ime = benga.mjesto;

        // hardcodamo jer nema drugog nacina
        if (benga.ime == "Tifon") {
          benga.img = "https://tifon.hr/images/fb-tifon-logo.jpg";
        } else if (benga.ime == "INA") {
          benga.img = "https://ina.ea93.work/wp-content/uploads/2020/01/ina-logo-big-2.jpg";
        } else if (benga.ime == "Crodux derivati") {
          benga.img = "https://scontent.fzag4-1.fna.fbcdn.net/v/t1.0-9/42576275_2414705741890598_121577626362970112_n.png?_nc_cat=107&_nc_sid=09cbfe&_nc_eui2=AeFc-WfsL5AWx5vizwUuKaMOTKZFDZgHr8ZMpkUNmAevxjnTzTLZC2QLpYSQsezKiIlxwrE-1HJg_UIM1NvnNfEQ&_nc_ohc=KCw3UKw8g7kAX9qj71S&_nc_ht=scontent.fzag4-1.fna&oh=62988a1e1b667337b5319d18b109f900&oe=5EC6DD05";
        } else if (benga.ime == "Petrol") {
          benga.img = "https://webservis.mzoe-gor.hr/img/obv_9_logo.png";
        } else if (benga.ime == "Lukoil") {
          benga.img = "https://www.soundsetragusa.hr/sites/default/files/lukoil.jpg?width=825&height=550&slideshow=true&slideshowAuto=false&slideshowSpeed=2000&transition=elastic&speed=350";
        }

        benga.lat = json[i]['Lat'];
        benga.lon = json[i]['Lon'];
        let udaljenost = this.benzinske.calculateDistance(benga.lat, benga.lon);
        udaljenost = Math.round(udaljenost * 10) / 10;
        benga.udaljenost = udaljenost;

        this.jsonBenge.push(benga);
        this.benzinske.hakBenzinske.push(benga);
        if (udaljenost <= 5) {
          this.hakParser.parse(benga).then(data => {
            if(data.imaGorivo) {
              this.benzinske.filterBenga.push(data);
              this.hakParser.loadedData = true;
            }
          });
        }

      }


    });
  }

  get(benga: Postaja) {

    this.benzinske.trenutnaBenga = benga;
    this.router.navigate(['/pocetna/detalji/'], { relativeTo: this.route });
  }

  input(event: any) {
    let query = event.target.value;

    this.benzinske.getQuery(query).then(data => {
      let json = data.data;

      console.log(json);

      json = json.substr(7, json.length - 8);
      json = JSON.parse(json);
      console.log(json);
    });
  }

  ionViewDidLeave() {
    const animation = this.animationController.create().addElement(document.getElementById('home')).iterations(1).duration(500).fromTo('opacity', 1, 0);
    animation.play();
    this.subscription.unsubscribe();
  }
  selectChange(event: any) {
    let value = event.target.value;

    this.hakParser.trenutnoGorivo = value;
    this.getBenzin(this.hakParser.trenutnoGorivo);

  }

  async filter(ev: any) {
    console.log("filter");

    const popover = await this.popoverController.create({
      component: PopoverComponent,
      event: ev,
      translucent: true
    });

    this.benzinske.popover = popover;

    return await popover.present();
  }

  doRefresh(event: any) {
    console.log("refresh");
    // this.benzinske.filterBenga = [];
    // this.reloading = true;
    // this.hakParser.loadedData = false;
    // this.geolocation.getCurrentPosition().then((resp) => {

    //   this.benzinske.lat = resp.coords.latitude;
    //   this.benzinske.lon = resp.coords.longitude;
    //   let brojUdaljenosti = 0;
    //   let complete = false;
    //   for (let i = 0; i < this.jsonBenge.length; i++) {
    //     let benga = this.jsonBenge[i];
    //     let udaljenost = this.benzinske.calculateDistance(benga.lat, benga.lon);
    //     udaljenost = Math.round(udaljenost * 10) / 10
    //     benga.udaljenost = udaljenost;

    //     if (udaljenost <= this.benzinske.radius) {
    //       this.hakParser.parse(benga).then(data => {
    //         if(data.imaGorivo) {
    //           this.benzinske.filterBenga.push(data);
    //           this.hakParser.loadedData = true;
    //           this.reloading = false;
    //           setTimeout(() => {
    //             const animation = this.animationController.create().addElement(document.getElementById("" + data.id)).
    //               duration(300).iterations(1).fromTo('opacity', '0', '1');
  
    //             animation.play();
    //           }, 50)
    //           if (!complete) {
    //             complete = true;
    //             setTimeout(() => {
    //               event.target.complete();
                  
    //             }, 1500);
    //           }
    //         }
            
    //       });

    //     }

    //   }

    // }).catch(err => {
    //   console.log("err: " + err);

    // });
  }

  getBenzin(gorivo: string) {

    let id = -1;
    switch (gorivo) {
      case "DIZELA":
        id = 8;
        break;
      case "BENZINA":
        id = 2;
        break;
      case "AUTOPLIN":
        id = 9;
        break;
      case "PLAVI-DIZEL":
        id = 11;
        break;
    }
    let ima = false;
    for (let i = 0; i < this.benzinske.filterPostaji.length; i++) {
      // neke postaje nemaju autoplin i plavi dizel..
      if (id == 9 || id == 11)
        this.benzinske.filterPostaji[i].gorivo = "---";
      for (let j = 0; j < this.benzinske.filterPostaji[i].cijenici.length; j++) {

        if (this.benzinske.filterPostaji[i].cijenici[j].vrstaGorivaId == id) {
          this.benzinske.filterPostaji[i].gorivo = this.benzinske.filterPostaji[i].cijenici[j].cijena.toFixed(2);
          ima = true;
        }
      }
      // posto neke benzinske nemaju benzin bez aditiva onda gledamo benzin sa aditivima
      if (!ima) {
        if (id == 2) {
          // id -= 1;
          let temp = id - 1;
          for (let j = 0; j < this.benzinske.filterPostaji[i].cijenici.length; j++) {
            if (this.benzinske.filterPostaji[i].cijenici[j].vrstaGorivaId == temp) {
              this.benzinske.filterPostaji[i].gorivo = this.benzinske.filterPostaji[i].cijenici[j].cijena.toFixed(2);
            }
          }
        } else if(id == 8) {
          for (let j = 0; j < this.benzinske.filterPostaji[i].cijenici.length; j++) {
            if (this.benzinske.filterPostaji[i].cijenici[j].vrstaGorivaId == id-1) {
              this.benzinske.filterPostaji[i].gorivo = this.benzinske.filterPostaji[i].cijenici[j].cijena.toFixed(2);
            }
          }
        }
      }
      ima = false;
    }
  }

}
