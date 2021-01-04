import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { RadnoVrijeme } from '../benzinska/radnovrijeme';
import { BenzinskePostajeService } from '../service/benzinske-postaje.service';
import { Platform, ToastController, PopoverController, AnimationController } from '@ionic/angular';
import { PopoverComponent } from '../popover/popover.component';
import { ActivatedRoute, Router } from '@angular/router';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Usluge } from '../benzinska/usluge';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { Diagnostic } from '@ionic-native/diagnostic/ngx';
import { Gorivo } from '../benzinska/gorivo';
import { BackgroundMode } from '@ionic-native/background-mode/ngx';
import { LaunchReview } from '@ionic-native/launch-review/ngx';
import { Postaja } from '../benzinska/postaja';
import { Chart } from 'chart.js';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {

  @ViewChild("grafikon", { static: true }) canvas: ElementRef;

  public permission: boolean;
  public reloading: boolean = false;
  public grad: string = "blizini";
  public subscription: any;
  
  // -
  // https://nominatim.org/release-docs/develop/api/Search/

  constructor(
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
                  this.benzinske.loadedData = true;

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
        this.benzinske.loadedData = true;
      }

    });


    // this.prosjecneCijene();
    this.platform.ready().then(data => {
      
      this.benzinske.trenutnoGorivo = "DIZELA"; 
    });
  }

  async presentToast() {
    const toast = await this.toastController.create({
      message: "GPS je isključen, upalite GPS.",
      duration: 2000
    });
    toast.present();
  }
  /*
    id 1 - benzinsko
    id 2 - dizel
    id 3 - autoplin
    id 4 - plinsko ulje
  */
  prosjecneCijene() {
    let lineChart = new Chart(this.canvas.nativeElement, {
      type: "line",
      options: {
        maintainAspectRatio: false,
        spanGaps: true,
        animation: {
          duration: 0
        },
        hover: {
          animationDuration: 0
        },
        responsiveAnimationDuration: 0,
        elements: {
          line: {
            tension: 0,
            fill: false,
            stepped: false,
            borderDash: []
          }
        }
      }
    });
    this.benzinske.getTrend().subscribe(data => {
      console.log(data);
      
    })
    lineChart.render();
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

  imgNotLoaded(benga: Postaja) {
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
    this.benzinske.loadedData = false;

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
      this.benzinske.loadedData = true;
    }).catch(err => {
      console.log("err: " + err);

    });

  }

  get(benga: Postaja) {
    console.log(benga);
    
    this.benzinske.trenutnaBenga = benga;
    this.router.navigate(['/pocetna/detalji/'], { relativeTo: this.route });
  }

  ionViewDidLeave() {
    const animation = this.animationController.create().addElement(document.getElementById('home')).iterations(1).duration(500).fromTo('opacity', 1, 0);
    animation.play();
    this.subscription.unsubscribe();
  }
  selectChange(event: any) {
    let value = event.target.value;

    this.benzinske.trenutnoGorivo = value;
    this.getBenzin(this.benzinske.trenutnoGorivo);

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
