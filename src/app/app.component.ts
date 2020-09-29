import { Component, OnInit, OnDestroy } from '@angular/core';
import { BeepService } from './beep.service';
import Quagga from 'quagga';
import { Article } from './article';
import { ShoppingCart } from './shopping-cart';
import { ApiService } from './api.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {

  errorMessage: string;
  destroy$ = new Subject<void>();
  private catalogue: Article[] = [];

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

    this.api.get('assets/db.json')
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        this.catalogue = res;
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
    } else {
      this.shoppingCart.addArticle(article);
      this.lastScannedCodeDate = now;
      this.beepService.beep();
    }

  }

  onClick() {
    window.print();
  }

  ngOnDestroy(){
    this.destroy$.next();
  }

}
