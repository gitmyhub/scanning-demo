import { Component, OnInit, OnDestroy } from '@angular/core';
import { ShoppingCart } from '../shopping-cart';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-shopping-cart-item',
  templateUrl: './shopping-cart-item.component.html',
  styleUrls: ['./shopping-cart-item.component.scss']
})
export class ShoppingCartItemComponent implements OnInit, OnDestroy {

  shoppingCartItems: any;
  totalPrice: any;
  destroy$ = new Subject<void>();

  constructor(public shoppingCart: ShoppingCart) {
  }

  ngOnInit(): void {
    this.shoppingCart.getArticles()
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        this.shoppingCartItems = res;
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
  ngOnDestroy() {
    this.destroy$.next();
  }

}
