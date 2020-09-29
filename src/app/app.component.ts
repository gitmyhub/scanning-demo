import { AfterViewInit, ChangeDetectorRef, AfterContentChecked, Component, ElementRef, OnInit, ViewChild, AfterViewChecked } from '@angular/core';
import { BeepService } from './beep.service';
import Quagga from 'quagga';
import { Article } from './article';
import { ShoppingCart } from './shopping-cart';
import { ApiService } from './api.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{

  errorMessage: string;

  private catalogue: Article[] = [
    { name: 'Classy Crab (red)', ean: '7601234567890', image: 'assets/classy_crab_red.png', price: 10 },
    { name: 'Classy Crab (blue)', ean: '7601234561232', image: 'assets/classy_crab_blue.png', price: 10 },
    { name: 'Classy Crab (gold, ltd. ed.)', ean: '7601234564561', image: 'assets/classy_crab_gold.png', price: 50 },
    { name: 'Classy Crab (Diamond, ltd. ed.)', ean: '7601274167890', image: 'assets/classy_crab_gold.png', price: 100 },
  ];

  private lastScannedCodeDate: number;

  constructor(
              private beepService: BeepService,
              private api: ApiService,
              public shoppingCart: ShoppingCart) {
  }

  ngOnInit(): void {
    if (!navigator.mediaDevices || !(typeof navigator.mediaDevices.getUserMedia === 'function')) {
      this.errorMessage = 'getUserMedia is not supported';
      return;
    }

    this.api.get('assets/db.json').subscribe((res: any) => {
      this.catalogue  = res;
    });

    Quagga.init({
        inputStream: {
          constraints: {
            facingMode: 'environment'
          },
          area: { // defines rectangle of the detection/localization area
            top: '40%',    // top offset
            right: '0%',  // right offset
            left: '0%',   // left offset
            bottom: '40%'  // bottom offset
          },
        },
        decoder: {
          readers: ['ean_reader']
        },
      },
      (err) => {
        if (err) {
          this.errorMessage = `QuaggaJS could not be initialized, err: ${err}`;
        } else {
          Quagga.start();
          Quagga.onDetected((res) => {
            this.onBarcodeScanned(res.codeResult.code);
          });
        }
      });
  }

  onBarcodeScanned(code: string) {

    // ignore duplicates for an interval of 1.5 seconds
    const now = new Date().getTime();
    if (now < this.lastScannedCodeDate + 2000) {
      return;
    }

    // ignore unknown articles
    const article = this.catalogue.find(a => a.ean === code);
    if (!article) {
      alert('Product not found');
    }else{
        this.shoppingCart.addArticle(article);
        this.lastScannedCodeDate = now;
        this.beepService.beep();
    }


    // this.changeDetectorRef.detectChanges();
  }

  onClick(){
    window.print();
  }

}