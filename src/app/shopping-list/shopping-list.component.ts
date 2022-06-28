import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { Store } from '@ngrx/store'

import { LoggingService } from '../logging.service';
import { Ingredient } from '../shared/ingredient.model';
import { ShoppingListService } from './shopping-list.service';
import * as ShoppingListActions from './store/shopping-list.actions'
import * as fromApp from '../store/app.reducer' 

@Component({
  selector: 'app-shopping-list',
  templateUrl: './shopping-list.component.html',
  styleUrls: ['./shopping-list.component.css']
})
export class ShoppingListComponent implements OnInit, OnDestroy {
  ingredients: Observable<{ ingredients: Ingredient[] }>;
  private subscription: Subscription;

  constructor(
    private slService: ShoppingListService, 
    private loggingService: LoggingService, 
    private store: Store<fromApp.AppState>) { }

  ngOnInit() {
    this.ingredients = this.store.select('shoppingList');
    // this.ingredients = this.slService.getIngredients();
    // this.subscription = this.slService.ingredientsChanged
    //   .subscribe(
    //     (ingredients: Ingredient[]) => {
    //       this.ingredients = ingredients;
    //     }
    //   );
    // this.loggingService.printLog('Hello from ShoppingList Component NgOninit')
  }

  onEditItem(index: number) {
    this.store.dispatch(new ShoppingListActions.StartEdit(index))
    // this.slService.startedEditing.next(index);
  }

  ngOnDestroy() {
    // this.subscription.unsubscribe();
  }
}
