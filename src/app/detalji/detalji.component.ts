import { Component, OnInit } from '@angular/core';
import { BenzinskePostajeService } from '../service/benzinske-postaje.service';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Benzinska } from '../benzinska/benzinska';
import { LaunchNavigator, LaunchNavigatorOptions } from '@ionic-native/launch-navigator/ngx';
import { AnimationController } from '@ionic/angular';

@Component({
  selector: 'app-detalji',
  templateUrl: './detalji.component.html',
  styleUrls: ['./detalji.component.scss'],
})
export class DetaljiComponent implements OnInit {

  public trenutnaBenga: Benzinska;
  public vrijeme: string;
  public otvoreno: boolean;


  constructor(private service: BenzinskePostajeService,
              private statusBar: StatusBar,
              private launchnavigator: LaunchNavigator,
              private animationCtrl: AnimationController) { 
                this.trenutnaBenga = this.service.trenutnaBenga;
              }

  ngOnInit() {

    let date = new Date();
    if(date.getDay() >= 1 && date.getDay() <= 5) {

      this.vrijeme = this.parseTime(this.trenutnaBenga.radnoVrijeme.ponPet, date);

    } else if(date.getDay() == 0) {

      this.vrijeme = this.parseTime(this.trenutnaBenga.radnoVrijeme.ned, date);

    } else if(date.getDay() == 6) {
      this.vrijeme = this.parseTime(this.trenutnaBenga.radnoVrijeme.sub, date);
    }
    console.log(date.getDay());
    this.statusBar.backgroundColorByHexString('#fff');
  }

  parseTime(vrijeme: string, date: Date) {
      if(vrijeme == undefined) return;

      let splitTime = vrijeme.split("-");

      if(splitTime[0].length == 8) {
        splitTime[0] = splitTime[0].slice(0, splitTime[0].length-3);
      }
      
      splitTime[1] = splitTime[1].slice(0, splitTime[1].length-3);

      let time = splitTime[0] + "-" + splitTime[1];
      
      let pocetnoVrijeme = splitTime[0].slice(0, splitTime[0].length-3);
      let zavrsnoVrijeme = splitTime[1].slice(0, splitTime[1].length-3);

      if(date.getHours() < parseInt(zavrsnoVrijeme) && date.getHours() > parseInt(pocetnoVrijeme)) {
        this.otvoreno = true;
      } else {
        if(zavrsnoVrijeme === "24" && pocetnoVrijeme == "00") 
          this.otvoreno = true;
        else
          this.otvoreno = false;
      }
      return time;
  }

  ionViewDidEnter() {
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