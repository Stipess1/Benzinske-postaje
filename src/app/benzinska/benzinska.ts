import { GorivoHak } from './gorivoHak';
import { RadnoVrijeme } from './radnovrijeme';
import { Usluge } from './usluge';

export class Benzinska {
    id: string;
    mzoeId: string
    kompanija: string;
    ime: string;
    grad: string;
    // vrsteGoriva: string[];
    // cijenik: string[];
    vrsteGoriva: GorivoHak[] = [];
    radnoVrijeme: RadnoVrijeme;
    adresa: string;
    img: string;
    usluge: Usluge[];
    dizel: string;
    benzin: string;
    gorivo: string;
    lat: number;
    lon: number;
    imaGorivo: boolean;
    udaljenost: number;
    otvoreno: boolean;
    obveznikId: number;
    trenutnoRadnoVrijeme: string;

    nadiGorivoPoImenu(imeGoriva: string): boolean {
        for(let i = 0; i < this.vrsteGoriva.length; i++) {
            if(imeGoriva === this.vrsteGoriva[i].imeGoriva) 
                return true;
            
        }
        return false;
    }
}