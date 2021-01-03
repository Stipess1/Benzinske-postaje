export class Usluge {
    usluga: string;
    opcija_id: number;
    img: string;

    constructor(opcija_id: number) {
        
        switch(opcija_id) {
            case 1:
                this.usluga = "Zamjena motornoga ulja";
                this.img = "../../assets/icon/pump/ulje.svg";
                break;
            case 2:
                this.usluga = "Autopraonica";
                this.img = "../../assets/icon/pump/autopraonica.svg";
                break;
            case 3:
                this.usluga = "Opskrba plovila";
                this.img = "../../assets/icon/pump/brod.svg";
                break;
            case 4:
                this.usluga = "Hot spot/ Wifi";
                this.img = "../../assets/icon/pump/wifi.svg";
                break;
            case 5:
                this.usluga = "Bankomat";
                this.img = "../../assets/icon/pump/bankomat.svg";
                break;
            case 6:
                this.usluga = "WC";
                this.img = "../../assets/icon/pump/wc.svg";
                break;
            case 7:
                this.usluga = "Mjenjačnica";
                this.img = "../../assets/icon/pump/mjenjacnica.svg";
                break;
            case 8:
                this.usluga = "Trgovina";
                this.img = "../../assets/icon/pump/trgovina.svg";
                break;
            case 9:
                this.usluga = "Restoran";
                this.img = "../../assets/icon/pump/restoran.svg";
                break;
            case 10:
                this.usluga = "Caffe bar";
                this.img = "../../assets/icon/pump/coffee-bar.svg";
                break;
            case 11:
                this.usluga = "Pekarski proizvodi";
                this.img = "../../assets/icon/pump/pekara.svg";
                break;
            case 12:
                this.usluga = "WC za invalide";
                this.img = "../../assets/icon/pump/invalid.svg";
                break;
            case 13:
                this.usluga = "Previjalište za bebe";
                this.img = "../../assets/icon/pump/bebe.svg";
                break;
            case 14:
                this.usluga = "Tuš";
                this.img = "../../assets/icon/pump/tus.svg";
                break;
            case 15:
                this.usluga = "Dječje igralište/Igraonica";
                this.img = "../../assets/icon/pump/igraliste.svg";
                break;
            case 16:
                this.usluga = "Hotel/Motel";
                this.img = "../../assets/icon/pump/motel.svg";
                break;
            case 17:
                this.usluga = "Parking za autobuse";
                this.img = "../../assets/icon/pump/parking.svg";
                break;
            case 18:
                this.usluga = "Mjesto za kućne ljubmice";
                this.img = "../../assets/icon/pump/psi.svg";
                break;
            case 19:
                this.usluga = "Otvoreno 24 sata";
                this.img = "../../assets/icon/pump/24sat.svg";
                break;
        }
    }
}