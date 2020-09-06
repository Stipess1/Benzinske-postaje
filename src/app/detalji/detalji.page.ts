import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { DetaljiComponent } from './detalji.component';
// import { TranslateModule } from '@ngx-translate/core';

const routes: Routes = [
  {
    path: '',
    component: DetaljiComponent
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
  declarations: [DetaljiComponent],
  exports: [DetaljiComponent]
})
export class DetaljiPage {}
