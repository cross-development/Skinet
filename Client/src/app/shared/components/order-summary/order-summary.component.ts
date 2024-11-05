import { Component, inject, OnInit, signal, Signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe, Location, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { firstValueFrom } from 'rxjs';
import { CartService } from '../../../core/services/cart.service';
import { StripeService } from '../../../core/services/stripe.service';
import { ProductTotals } from '../../models/productTotals';
import { Coupon } from '../../models/cart';

@Component({
  selector: 'app-order-summary',
  standalone: true,
  imports: [
    RouterLink,
    MatButton,
    MatLabel,
    MatFormField,
    MatInput,
    MatIcon,
    CurrencyPipe,
    FormsModule,
    NgIf,
  ],
  templateUrl: './order-summary.component.html',
  styleUrl: './order-summary.component.scss',
})
export class OrderSummaryComponent implements OnInit {
  private cartService: CartService = inject(CartService);
  private stripeService: StripeService = inject(StripeService);

  public code?: string;
  public coupon?: Coupon;
  public location: Location = inject(Location);
  public totals: Signal<ProductTotals | null> = signal<ProductTotals | null>(null);

  public ngOnInit(): void {
    this.coupon = this.cartService.cart()?.coupon;
    this.totals = this.cartService.totals;
  }

  public applyCouponCode(): void {
    if (!this.code) return;

    this.cartService.applyDiscount(this.code).subscribe({
      next: async coupon => {
        const cart = this.cartService.cart();

        if (cart) {
          cart.coupon = coupon;
          this.cartService.setCart(cart);
          this.code = undefined;
        }

        if (this.location.path() === '/checkout') {
          await firstValueFrom(this.stripeService.createOrUpdatePaymentIntent());
        }
      },
    });
  }

  public async removeCouponCode(): Promise<void> {
    const cart = this.cartService.cart();

    if (!cart) {
      return;
    }

    if (cart.coupon) {
      cart.coupon = undefined;
    }

    this.cartService.setCart(cart);

    if (this.location.path() === '/checkout') {
      await firstValueFrom(this.stripeService.createOrUpdatePaymentIntent());
    }
  }
}
