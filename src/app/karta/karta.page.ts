import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { KartaComponent } from './karta.component';

const routes: Routes = [
  {
    path: '',
    component: KartaComponent
  }
];
@NgModule({
  imports: [
    CommonModule,
    // TranslateModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [KartaComponent],
  exports: [KartaComponent]
})
export class KartaPage {}
