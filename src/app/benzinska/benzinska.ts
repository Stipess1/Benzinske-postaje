import { RadnoVrijeme } from './radnovrijeme';
import { Usluge } from './usluge';

export class Benzinska {
    id: string;
    mzoeId: string
    kompanija: string;
    ime: string;
    grad: string;
    vrsteGoriva: string[];
    cijenik: string[];
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
}