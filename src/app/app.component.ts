import { Component, OnInit, OnDestroy } from '@angular/core';
import { BeepService } from './services/beep.service';
import Quagga from 'quagga';
import { Article } from './models/article';
import { ShoppingCartService } from './services/shopping-cart.service';
import { ApiService } from './services/api.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ErrorDialogComponent } from './error-dialog/error-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  dialogOpen: boolean;
  loading: boolean;
  errorMessage: string;
  destroy$ = new Subject<void>();
  showExitButton: boolean;
  private catalogue: Article[] = [];

  private lastScannedCodeDate: number;

  constructor(
    private beepService: BeepService,
    private api: ApiService,
    public dialog: MatDialog,
    public shoppingCartService: ShoppingCartService) {
  }

  ngOnInit(): void {
    if (!navigator.mediaDevices || !(typeof navigator.mediaDevices.getUserMedia === 'function')) {
      this.errorMessage = 'getUserMedia is not supported';
      return;
    }
    this.loading = true;
    this.showExitButton = false;
    this.api.get<Article[]>('assets/db.json')
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: Article[]) => {
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
          this.loading =  false;
          Quagga.onDetected((res) => {
            this.onBarcodeScanned(res.codeResult.code);
          });
        }
      });
  }

  onBarcodeScanned(code: string) {
    const scannedArticles = this.getScannedArticles();
    // ignore duplicates for an interval of 1.5 seconds
    const now = new Date().getTime();
    if (now < this.lastScannedCodeDate + 2000) {
      return;
    }

    // ignore unknown articles
    const article = this.catalogue.find(a => a.ean === code);
    if (!article) {
      this.openDialog();
    } else {
      this.shoppingCartService.addArticle(article);
      this.lastScannedCodeDate = now;
      this.beepService.beep();
    }

  }

  getScannedArticles(){
    this.shoppingCartService.getArticles().subscribe((articles: Map<Article, number>) => {
      if (articles.size > 0){
        this.showExitButton = true;
      }
    });
  }

  onExitClicked() {
    window.print();
  }

  ngOnDestroy(){
    this.destroy$.next();
  }

  openDialog(): void {
    if (!this.dialogOpen){
      this.dialogOpen = true;
      const dialogRef = this.dialog.open(ErrorDialogComponent, {
        width: '450px',
        data: 'Product not found'
      });
      dialogRef.afterClosed().subscribe(result => {
        this.dialogOpen = false;
      });
    }
  }
}
