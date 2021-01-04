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
      for(let i = 0; i < this.service.filterPostaji.length; i++) {
        for(let j = 0; j < this.service.filterPostaji.length; j++) {
          let prvi: number = +this.service.filterPostaji[i].gorivo.replace(",",".");
          let drugi: number = +this.service.filterPostaji[j].gorivo.replace(",",".");

          if(prvi < drugi) {
            let temp = this.service.filterPostaji[i];
            this.service.filterPostaji[i] = this.service.filterPostaji[j];
            this.service.filterPostaji[j] = temp;
          }
        }
      }
    } else if (filter === "visa"){
      for(let i = 0; i < this.service.filterPostaji.length; i++) {
        for(let j = 0; j < this.service.filterPostaji.length; j++) {
          let prvi: number = +this.service.filterPostaji[i].gorivo.replace(",",".");
          let drugi: number = +this.service.filterPostaji[j].gorivo.replace(",",".");
          if(prvi > drugi) {
            let temp = this.service.filterPostaji[i];
            this.service.filterPostaji[i] = this.service.filterPostaji[j];
            this.service.filterPostaji[j] = temp;
          }
        }
      }
    } else {
      for(let i = 0; i < this.service.filterPostaji.length; i++) {
        for(let j = 0; j < this.service.filterPostaji.length; j++) {
          if(this.service.filterPostaji[i].udaljenost < this.service.filterPostaji[j].udaljenost) {
            let temp = this.service.filterPostaji[i];
            this.service.filterPostaji[i] = this.service.filterPostaji[j];
            this.service.filterPostaji[j] = temp;
          }
        }
      }
    }
  }
}
