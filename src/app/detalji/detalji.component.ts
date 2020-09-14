import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { BenzinskePostajeService } from '../service/benzinske-postaje.service';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Benzinska } from '../benzinska/benzinska';
import { LaunchNavigator, LaunchNavigatorOptions } from '@ionic-native/launch-navigator/ngx';
import { AnimationController, NavController, Platform } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { Chart } from 'chart.js';
import { CijeniciPostaja } from '../benzinska/cijeniciPostaja';

@Component({
  selector: 'app-detalji',
  templateUrl: './detalji.component.html',
  styleUrls: ['./detalji.component.scss'],
})
export class DetaljiComponent implements OnInit {

  @ViewChild("grafikon", { static: true }) canvas: ElementRef;

  public trenutnaBenga: Benzinska;
  public vrijeme: string;
  public otvoreno: boolean;
  private lineChart: Chart;
  public cijenikPostaje: CijeniciPostaja[] = [];
  public subscription: any;


  constructor(private service: BenzinskePostajeService,
    private statusBar: StatusBar,
    private launchnavigator: LaunchNavigator,
    private animationCtrl: AnimationController,
    private http: HttpClient,
    private platform: Platform,
    private navCtrl: NavController) {
    this.trenutnaBenga = this.service.trenutnaBenga;
  }

  ngOnInit() {

    this.setDate();
    document.getElementById('header').style.marginTop = this.service.insetBar+"px";
    this.postaviGrafikon();

   
  }

  setDate() {
    let date = new Date();
    if (date.getDay() >= 1 && date.getDay() <= 5)
      this.vrijeme = this.parseTime(this.trenutnaBenga.radnoVrijeme.ponPet, date);
    else if (date.getDay() == 0)
      this.vrijeme = this.parseTime(this.trenutnaBenga.radnoVrijeme.ned, date);
    else if (date.getDay() == 6)
      this.vrijeme = this.parseTime(this.trenutnaBenga.radnoVrijeme.sub, date);

    this.statusBar.backgroundColorByHexString('#fff');
  }

  ionViewWillLeave() {
    this.subscription.unsubscribe();
  }



  zatvori() {
    this.navCtrl.back();
  }
  postaviGrafikon() {
    this.service.getCijenik(this.trenutnaBenga.mzoeId).then((data: any) => {
      let json = JSON.parse(data.data);

      for (let i = 0; i < json.length; i++) {
        let cijenik = new CijeniciPostaja();
        let date = new Date(json[i]['dat_poc']);
        let mjesec = date.getMonth() + 1;

        cijenik.cijena = json[i]['cijena'];
        cijenik.datum = date.getDate() + "." + mjesec + "." + date.getFullYear();

        cijenik.gorivoId = json[i]['gorivo_id'];

        for (let j = 0; j < this.service.vrsteGoriva.length; j++) {
          if (this.service.vrsteGoriva[j].id === cijenik.gorivoId) {
            cijenik.imeGoriva = this.service.vrsteGoriva[j].naziv;
            cijenik.tipGorivaId = this.service.vrsteGoriva[j].vrstaGorivaId;
            this.cijenikPostaje.push(cijenik);
          }
        }
      }

      // Dizel, benzin, autoplin...
      this.lineChart = new Chart(this.canvas.nativeElement, {
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
      /*
      tipGorivaId
      id = 1 - eurosuper 95 sa aditivima
      id = 2 - eurosuper 95 bez aditiva
      id = 5 - eurosuper 100 sa aditivima
      id = 6 - eurosuper 100 bez aditiva
      id = 7 - eurodizel sa aditivima
      id = 8 - eurodizel bez aditiva
      id = 9 - UNP (autoplin)
      id = 10 - plinsko ulje LU EL (lož ulje)
      id = 11 - plinsko ulje obojano plavom bojom (plavi dizel)
      id = 12 - bioetanol
      id = 13 - biodizel
      id - 14 - bioplin
      id - 15 - biometanol
      id - 16 - biodimetileter
      id - 17 - Bio-ETBE
      id - 18 - Bio-MTBE
      id - 19 - Biovodik
      id - 20 - Smjesa UNP za boce sadržaja 7.5kg
      id - 21 - Smjesa UNP za boce sadržaja 10kg
      id - 22 - Smjesa UNP za boce sadržaja 35kg
      */
      let imeGoriva = [];
      for (let i = 0; i < this.cijenikPostaje.length; i++) {
        let id = this.cijenikPostaje[i];

        this.lineChart.data.labels.push(id.datum);
        // neka goriva sadrze pod nazivom /\u00A0/ pa to moramo zamjenit sa razmakom.
        if (id.tipGorivaId == 8 && !imeGoriva.includes(id.imeGoriva) && !id.imeGoriva.includes("nije u portfelju") && this.trenutnaBenga.vrsteGoriva.includes(id.imeGoriva.replace(/\u00A0/, " "))) {
          let dataset = {
            label: id.imeGoriva,
            fill: false,
            backgroundColor: "rgb(92, 92, 92)",
            borderColor: "rgba(92, 92, 92, 0.4)",
            lineTension: 0.1,
            pointBorderColor: "rgba(92, 92, 92,0.4)",
            borderJoinStyle: "miter",
            data: [],
            pointBorderWidth: 1,
            spanGaps: true
          };

          this.lineChart.data.datasets.push(dataset);
          imeGoriva.push(id.imeGoriva);
        } else if (id.tipGorivaId == 2 && !imeGoriva.includes(id.imeGoriva) && !id.imeGoriva.includes("nije u portfelju") && this.trenutnaBenga.vrsteGoriva.includes(id.imeGoriva.replace(/\u00A0/, " "))) {
          let dataset = {
            label: id.imeGoriva,
            fill: false,
            backgroundColor: "rgb(141, 211, 116)",
            borderColor: "rgba(141, 211, 116, 0.4)",
            lineTension: 0.1,
            pointBorderColor: "rgba(141, 211, 116,0.4)",
            borderJoinStyle: "miter",
            data: [],
            pointBorderWidth: 1,
            spanGaps: true
          };

          this.lineChart.data.datasets.push(dataset);
          imeGoriva.push(id.imeGoriva);
        } else if (id.tipGorivaId == 7 && !imeGoriva.includes(id.imeGoriva) && !id.imeGoriva.includes("nije u portfelju") && this.trenutnaBenga.vrsteGoriva.includes(id.imeGoriva.replace(/\u00A0/, " "))) {
          let dataset = {
            label: id.imeGoriva,
            fill: false,
            backgroundColor: "rgb(211, 43, 43)",
            borderColor: "rgba(211, 43, 43, 0.4)",
            lineTension: 0.1,
            pointBorderColor: "rgba(211, 43, 43, 0.4)",
            borderJoinStyle: "miter",
            data: [],
            pointBorderWidth: 1,
            spanGaps: true
          };

          this.lineChart.data.datasets.push(dataset);
          imeGoriva.push(id.imeGoriva);
        } else if (id.tipGorivaId == 1 && !imeGoriva.includes(id.imeGoriva) && !id.imeGoriva.includes("nije u portfelju") && this.trenutnaBenga.vrsteGoriva.includes(id.imeGoriva.replace(/\u00A0/, " "))) {
          let dataset = {
            label: id.imeGoriva,
            fill: false,
            backgroundColor: "rgb(123, 201, 95)",
            borderColor: "rgba(123, 201, 95, 0.4)",
            lineTension: 0.1,
            pointBorderColor: "rgba(123, 201, 95,0.4)",
            borderJoinStyle: "miter",
            data: [],
            pointBorderWidth: 1,
            spanGaps: true
          };

          this.lineChart.data.datasets.push(dataset);
          imeGoriva.push(id.imeGoriva);
        } else if (id.tipGorivaId == 9 && !imeGoriva.includes(id.imeGoriva) && this.trenutnaBenga.vrsteGoriva.includes(id.imeGoriva.replace(/\u00A0/, " "))) {
          let dataset = {
            label: id.imeGoriva,
            fill: false,
            backgroundColor: "rgb(250, 192, 45)",
            borderColor: "rgba(250, 192, 45, 0.4)",
            lineTension: 0.1,
            pointBorderColor: "rgb(250, 192, 45, 0.4)",
            borderJoinStyle: "miter",
            data: [],
            pointBorderWidth: 1,
            spanGaps: true
          };
          this.lineChart.data.datasets.push(dataset);
          imeGoriva.push(id.imeGoriva);
        } else if (id.tipGorivaId == 6 && !imeGoriva.includes(id.imeGoriva) && this.trenutnaBenga.vrsteGoriva.includes(id.imeGoriva.replace(/\u00A0/, " "))) {
          let dataset = {
            label: id.imeGoriva,
            fill: false,
            backgroundColor: "rgb(103, 168, 79)",
            borderColor: "rgba(103, 168, 79, 0.4)",
            lineTension: 0.1,
            pointBorderColor: "rgb(103, 168, 79, 0.4)",
            borderJoinStyle: "miter",
            data: [],
            pointBorderWidth: 1,
            spanGaps: true
          };
          this.lineChart.data.datasets.push(dataset);
          imeGoriva.push(id.imeGoriva);
        } else if (id.tipGorivaId == 5 && !imeGoriva.includes(id.imeGoriva) && this.trenutnaBenga.vrsteGoriva.includes(id.imeGoriva.replace(/\u00A0/, " "))) {
          let dataset = {
            label: id.imeGoriva,
            fill: false,
            backgroundColor: "rgb(90, 148, 68)",
            borderColor: "rgba(90, 148, 68, 0.4)",
            lineTension: 0.1,
            pointBorderColor: "rgb(90, 148, 68, 0.4)",
            borderJoinStyle: "miter",
            data: [],
            pointBorderWidth: 1,
            spanGaps: true
          };
          this.lineChart.data.datasets.push(dataset);
          imeGoriva.push(id.imeGoriva);
        }
      }

      for (let i = 0; i < this.cijenikPostaje.length; i++) {
        let id = this.cijenikPostaje[i];

        for (let j = 0; j < this.lineChart.data.datasets.length; j++) {
          if (this.lineChart.data.datasets[j].label === id.imeGoriva) {
            let index = this.lineChart.data.labels.indexOf(id.datum);
            this.lineChart.data.datasets[j].data[index] = id.cijena;
          }
        }

      }
      this.lineChart.update();
    });
  }

  logScrolling(event: any) {
    if (event.detail.scrollTop > 2) {
      document.getElementById('header').classList.remove('ion-no-border');
    } else {
      document.getElementById('header').classList.add('ion-no-border');
    }
  }
  /**
   * Prima radno vrijeme benzinske (npr. 00:00:00-24:00:00 ), te skracuje
   * zadnje dvije nule i provjerava dali je benzinska trenutno otvorena
   * za odredene benzinske nema radnog vremena za neke dane pa je {vrijeme}
   * undefined
   * @param {string} vrijeme - Radno vrijeme benzinske
   * @param {Date} date - Danasnji datum
   * @returns {string} - vraca radno vrijeme benzinske (npr. 06:00 - 24:00)
   */
  parseTime(vrijeme: string, date: Date): string {
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
      this.otvoreno = true;
    } else {
      if (zavrsnoVrijeme === "24" && pocetnoVrijeme == "00")
        this.otvoreno = true;
      else
        this.otvoreno = false;
    }
    return time;
  }

  ionViewDidEnter() {
    this.subscription = this.platform.backButton.subscribeWithPriority(9999, () => {
      this.navCtrl.back();
    });
    const animation = this.animationCtrl.create().addElement(document.getElementById("content")).duration(500).iterations(1).fromTo('opacity', 0, 1);
    animation.play();
  }

  ionViewDidLeave() {
    const animation = this.animationCtrl.create().addElement(document.getElementById("content")).duration(500).iterations(1).fromTo('opacity', 1, 0);
    animation.play();
  }
  odvedi() {
    let cords = this.service.lat.toString() + ", " + this.service.lon.toString();
    let dest = this.trenutnaBenga.adresa + ", " + this.trenutnaBenga.grad;

    this.launchnavigator.navigate(dest, {
      start: cords
    });
  }
}