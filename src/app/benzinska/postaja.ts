import { Cijenik } from "./cijenik";
import { Gorivo } from "./gorivo";
import { RadnoVrijeme } from "./radnovrijeme";
import { Usluge } from "./usluge";

export class Postaja {
    adresa: string;
    cijenici: Cijenik[] = [];
    id: string;
    lat: number;
    long: number;
    mjesto: string;
    naziv: string;
    obveznikId: number;
    opcije: Usluge[] = [];
    radnaVremena: RadnoVrijeme;
    obveznik: string;
    otvoreno: boolean;
    img: any;
    trenutnoRadnoVrijeme: string;
    udaljenost: number;
    gorivo: string;

    nadiGorivoPoId(id: number): boolean {
        for(let i = 0; i < this.cijenici.length; i++) {
            if(this.cijenici[i].gorivo_id === id) 
                return true;
            
        }
        return false;
    }
}