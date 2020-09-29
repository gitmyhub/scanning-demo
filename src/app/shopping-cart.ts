import { Article } from './article';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ShoppingCart {

  private itemsSubject: BehaviorSubject<Map<Article, number>> = new BehaviorSubject<Map<Article, number>>(new Map<Article, number>());

  public items$: Observable<Map<Article, number>> = this.itemsSubject.asObservable();

  setArticle(articles: Map<Article, number>) {
    this.itemsSubject.next(articles);
  }

  getArticles(): Observable<Map<Article, number>>{
    return this.items$;
  }

  addArticle(article: Article){
    const items = this.itemsSubject.getValue();
    if (items.has(article)) {
      items.set(article, items.get(article) + 1);
    } else {
      items.set(article, 1);
    }
    this.itemsSubject.next(items);
  }
}
