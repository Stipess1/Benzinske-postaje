import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PocetnaPage } from './pocetna.page';

const routes: Routes = [
  {
    path: '',
    component: PocetnaPage,
    children: [
      {
        path: 'home',
        loadChildren: './home/home.page#HomePage'
      },
      {
        path: 'karta',
        loadChildren: './karta/karta.page#KartaPage'
      },
      {
        path: 'detalji',
        loadChildren: './detalji/detalji.page#DetaljiPage'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PocetnaPageRoutingModule {}
