import { Component, inject, OnInit, output, OutputEmitterRef } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { MatRadioModule } from '@angular/material/radio';
import { CartService } from '../../../core/services/cart.service';
import { CheckoutService } from '../../../core/services/checkout.service';
import { DeliveryMethod } from '../../../shared/models/deliveryMethod';

@Component({
  selector: 'app-checkout-delivery',
  standalone: true,
  imports: [MatRadioModule, CurrencyPipe],
  templateUrl: './checkout-delivery.component.html',
  styleUrl: './checkout-delivery.component.scss',
})
export class CheckoutDeliveryComponent implements OnInit {
  private cartService: CartService = inject(CartService);
  private checkoutService: CheckoutService = inject(CheckoutService);

  public deliveryMethods: DeliveryMethod[] = [];
  public selectedDelivery: DeliveryMethod | null = null;
  public deliveryComplete: OutputEmitterRef<boolean> = output<boolean>();

  public ngOnInit(): void {
    this.selectedDelivery = this.cartService.selectedDelivery();

    this.checkoutService.getDeliveryMethods().subscribe({
      next: methods => {
        this.deliveryMethods = methods;

        const deliveryMethodId = this.cartService.cart()?.deliveryMethodId;

        if (deliveryMethodId) {
          const method = methods.find(method => method.id === deliveryMethodId);

          if (method) {
            this.cartService.selectedDelivery.set(method);
            this.deliveryComplete.emit(true);
          }
        }
      },
      error: error => console.log(error),
    });
  }

  public updateDeliveryMethod(method: DeliveryMethod): void {
    this.cartService.selectedDelivery.set(method);

    const cart = this.cartService.cart();

    if (cart) {
      cart.deliveryMethodId = method.id;
      this.cartService.setCart(cart);
      this.deliveryComplete.emit(true);
    }
  }
}
