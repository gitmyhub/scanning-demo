import { Component, OnInit, OnDestroy } from '@angular/core';
import { ShoppingCartService } from '../services/shopping-cart.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Article } from '../models/article';

@Component({
  selector: 'app-shopping-cart-item',
  templateUrl: './shopping-cart-item.component.html',
  styleUrls: ['./shopping-cart-item.component.scss']
})
export class ShoppingCartItemComponent implements OnInit, OnDestroy {

  shoppingCartItems: Map<Article, number>;
  totalPrice: number;
  destroy$ = new Subject<void>();

  constructor(public shoppingCartService: ShoppingCartService) {
  }

  ngOnInit(): void {
    this.shoppingCartService.getArticles()
      .pipe(takeUntil(this.destroy$))
      .subscribe((scannedArticles: Map<Article, number>) => {
        this.shoppingCartItems = scannedArticles;
        this.totalPrice = this.getTotalPrice();
      });
  }
  isEmpty(): boolean {
    return this.shoppingCartItems.size === 0;
  }

  getTotalPrice(): number {
    let total = 0;
    for (const entry of this.shoppingCartItems.entries()) {
      total += entry[0].price * entry[1];
    }
    return total;
  }
  ngOnDestroy(): void {
    this.destroy$.next();
  }

}
