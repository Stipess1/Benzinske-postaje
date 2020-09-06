import { Component, OnInit } from '@angular/core';
import { BenzinskePostajeService } from '../service/benzinske-postaje.service';

@Component({
  selector: 'app-popover',
  templateUrl: './popover.component.html',
  styleUrls: ['./popover.component.scss'],
})
export class PopoverComponent implements OnInit {

  constructor(private service: BenzinskePostajeService) { }

  ngOnInit() {}

  dismiss(ev: any, filter: string) {
    this.service.filter = filter;
    console.log(filter);

    this.service.popover.dismiss().then(() => {
      this.service.popover = null;
    });

    if(filter === "niza") {
      for(let i = 0; i < this.service.filterBenga.length; i++) {
        for(let j = 0; j < this.service.filterBenga.length; j++) {
          if(this.service.filterBenga[i].gorivo.replace(",",".") < this.service.filterBenga[j].gorivo.replace(",",".")) {
            let temp = this.service.filterBenga[i];
            this.service.filterBenga[i] = this.service.filterBenga[j];
            this.service.filterBenga[j] = temp;
          }
        }
      }
    } else if (filter === "visa"){
      for(let i = 0; i < this.service.filterBenga.length; i++) {
        for(let j = 0; j < this.service.filterBenga.length; j++) {
          if(this.service.filterBenga[i].gorivo.replace(",",".") > this.service.filterBenga[j].gorivo.replace(",",".")) {
            let temp = this.service.filterBenga[i];
            this.service.filterBenga[i] = this.service.filterBenga[j];
            this.service.filterBenga[j] = temp;
          }
        }
      }
    } else {
      for(let i = 0; i < this.service.filterBenga.length; i++) {
        for(let j = 0; j < this.service.filterBenga.length; j++) {
          if(this.service.filterBenga[i].udaljenost < this.service.filterBenga[j].udaljenost) {
            let temp = this.service.filterBenga[i];
            this.service.filterBenga[i] = this.service.filterBenga[j];
            this.service.filterBenga[j] = temp;
          }
        }
      }
    }
  }
}
