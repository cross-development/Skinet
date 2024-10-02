import { Component, Signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { MatInput } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { CartService } from '../../../core/services/cart.service';
import { ProductTotals } from '../../models/productTotals';

@Component({
  selector: 'app-order-summary',
  standalone: true,
  imports: [RouterLink, MatButton, MatLabel, MatFormField, MatInput, CurrencyPipe],
  templateUrl: './order-summary.component.html',
  styleUrl: './order-summary.component.scss',
})
export class OrderSummaryComponent {
  public totals: Signal<ProductTotals | null>;

  constructor(private readonly cartService: CartService) {
    this.totals = this.cartService.totals;
  }
}
