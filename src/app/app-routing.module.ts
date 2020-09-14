import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'home',
    loadChildren: './home/home.page#HomePage'
  },
  {
    path: '',
    redirectTo: 'pocetna/home',
    pathMatch: 'full'
  },
  {
    path: 'detalji',
    loadChildren: './detalji/detalji.page#DetaljiPage'
  },
  {
    path: 'karta',
    loadChildren: './karta/karta.page#KartaPage'
  },
  {
    path: 'pocetna',
    loadChildren: () => import('./pocetna/pocetna.module').then( m => m.PocetnaPageModule)
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
