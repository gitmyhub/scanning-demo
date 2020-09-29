import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ShoppingCart } from '../shopping-cart';

@Component({
  selector: 'app-shopping-cart-item',
  templateUrl: './shopping-cart-item.component.html',
  styleUrls: ['./shopping-cart-item.component.scss']
})
export class ShoppingCartItemComponent implements OnInit {

  constructor(public shoppingCart: ShoppingCart) {
  }

  shoppingCartItems: any = new Map();
  totalPrice: any;

  ngOnInit(): void {
    this.shoppingCart.getArticles().subscribe((res) => {
      setTimeout(() => {
        this.shoppingCartItems = res;
        this.totalPrice = this.getTotalPrice();
      });
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

}
