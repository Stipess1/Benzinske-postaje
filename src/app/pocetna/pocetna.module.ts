import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PocetnaPageRoutingModule } from './pocetna-routing.module';

import { PocetnaPage } from './pocetna.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PocetnaPageRoutingModule
  ],
  declarations: [PocetnaPage]
})
export class PocetnaPageModule {}
