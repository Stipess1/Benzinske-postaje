export class Usluge {
    usluga: string;
    img: string;

    constructor(usluga: string) {
        this.usluga = usluga;
        
        switch(usluga) {
            case "Zamjena motornoga ulja":
                this.img = "../../assets/icon/pump/ulje.svg";
                break;
            case "Autopraonica":
                this.img = "../../assets/icon/pump/autopraonica.svg";
                break;
            case "Opskrba plovila":
                this.img = "../../assets/icon/pump/brod.svg";
                break;
            case "Hot spot/ Wifi":
                this.img = "../../assets/icon/pump/wifi.svg";
                break;
            case "Bankomat":
                this.img = "../../assets/icon/pump/bankomat.svg";
                break;
            case "WC":
                this.img = "../../assets/icon/pump/wc.svg";
                break;
            case "Mjenjačnica":
                this.img = "../../assets/icon/pump/mjenjacnica.svg";
                break;
            case "Trgovina":
                this.img = "../../assets/icon/pump/trgovina.svg";
                break;
            case "Restoran":
                this.img = "../../assets/icon/pump/restoran.svg";
                break;
            case "Caffe bar":
                this.img = "../../assets/icon/pump/coffee-bar.svg";
                break;
            case "Pekarski proizvodi":
                this.img = "../../assets/icon/pump/pekara.svg";
                break;
            case "WC za invalide":
                this.img = "../../assets/icon/pump/invalid.svg";
                break;
            case "Previjalište za bebe":
                this.img = "../../assets/icon/pump/bebe.svg";
                break;
            case "Tuš":
                this.img = "../../assets/icon/pump/tus.svg";
                break;
            case "Dječje igralište/Igraonica":
                this.img = "../../assets/icon/pump/igraliste.svg";
                break;
            case "Hotel/Motel":
                this.img = "../../assets/icon/pump/motel.svg";
                break;
            case "Parking za autobuse":
                this.img = "../../assets/icon/pump/parking.svg";
                break;
            case "Mjesto za kućne ljubmice":
                this.img = "../../assets/icon/pump/psi.svg";
                break;
            case "Otvoreno 24 sata":
                this.img = "../../assets/icon/pump/24sat.svg";
                break;
        }
    }
}