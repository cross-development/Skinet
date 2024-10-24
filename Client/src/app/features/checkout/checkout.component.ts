import { Component, inject, OnDestroy, OnInit, signal, Signal, WritableSignal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { MatButton } from '@angular/material/button';
import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxChange, MatCheckboxModule } from '@angular/material/checkbox';
import { firstValueFrom } from 'rxjs';
import {
  StripeAddressElement,
  StripePaymentElement,
  StripeAddressElementChangeEvent,
  StripePaymentElementChangeEvent,
  ConfirmationToken,
} from '@stripe/stripe-js';
import { CartService } from '../../core/services/cart.service';
import { StripeService } from '../../core/services/stripe.service';
import { AccountService } from '../../core/services/account.service';
import { SnackbarService } from '../../core/services/snackbar.service';
import { CheckoutReviewComponent } from './checkout-review/checkout-review.component';
import { CheckoutDeliveryComponent } from './checkout-delivery/checkout-delivery.component';
import { Address } from '../../shared/models/user';
import { OrderToCreate, ShippingAddress } from '../../shared/models/order';
import { ProductTotals } from '../../shared/models/productTotals';
import { CompletionStatus } from '../../shared/models/completionStatus';
import { OrderSummaryComponent } from '../../shared/components/order-summary/order-summary.component';
import { OrderService } from '../../core/services/order.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    RouterLink,
    CurrencyPipe,
    MatButton,
    MatStepperModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    OrderSummaryComponent,
    CheckoutReviewComponent,
    CheckoutDeliveryComponent,
  ],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss',
})
export class CheckoutComponent implements OnInit, OnDestroy {
  private router: Router = inject(Router);
  private cartService: CartService = inject(CartService);
  private orderService: OrderService = inject(OrderService);
  private stripeService: StripeService = inject(StripeService);
  private accountService: AccountService = inject(AccountService);
  private snackbarService: SnackbarService = inject(SnackbarService);

  public stripeAddressElement?: StripeAddressElement;
  public stripePaymentElement?: StripePaymentElement;
  public saveAddress: boolean = false;
  public totals: Signal<ProductTotals | null> = this.cartService.totals;
  public completionStatus: WritableSignal<CompletionStatus> = signal({
    address: false,
    card: false,
    delivery: false,
  });
  public confirmationToken?: ConfirmationToken;
  public loading: boolean = false;

  public async ngOnInit(): Promise<void> {
    try {
      this.stripeAddressElement = await this.stripeService.createAddressElement();
      this.stripeAddressElement?.mount('#address-element');
      this.stripeAddressElement?.on('change', this.handleAddressChange);

      this.stripePaymentElement = await this.stripeService.createPaymentElement();
      this.stripePaymentElement?.mount('#payment-element');
      this.stripePaymentElement.on('change', this.handlePaymentChange);
    } catch (error: any) {
      this.snackbarService.error(error.message);
    }
  }

  public ngOnDestroy(): void {
    this.stripeService.disposeElements();
  }

  public onSaveAddressCheckboxChange(event: MatCheckboxChange): void {
    this.saveAddress = event.checked;
  }

  public async onStepChange(event: StepperSelectionEvent): Promise<void> {
    if (event.selectedIndex === 1 && this.saveAddress) {
      const address = (await this.getAddressFromStripeAddress()) as Address;

      address && firstValueFrom(this.accountService.updateAddress(address));
    }

    if (event.selectedIndex == 2) {
      await firstValueFrom(this.stripeService.createOrUpdatePaymentIntent());
    }

    if (event.selectedIndex === 3) {
      await this.getConfirmationToken();
    }
  }

  public handleDeliveryChange(event: boolean): void {
    this.completionStatus.update(state => {
      state.delivery = event;

      return state;
    });
  }

  public async getConfirmationToken(): Promise<void> {
    try {
      if (Object.values(this.completionStatus()).every(status => status)) {
        const result = await this.stripeService.createConfirmationToken();

        if (result.error) {
          throw new Error(result.error.message);
        }

        this.confirmationToken = result.confirmationToken;
      }
    } catch (error: any) {
      this.snackbarService.error(error.message);
    }
  }

  public async confirmPayment(stepper: MatStepper): Promise<void> {
    this.loading = true;

    try {
      if (this.confirmationToken) {
        const result = await this.stripeService.confirmPayment(this.confirmationToken);

        if (result.paymentIntent?.status === 'succeeded') {
          const order = await this.createOrderModel();
          const orderResult = await firstValueFrom(this.orderService.createOrder(order));

          if (orderResult) {
            this.cartService.deleteCart();
            this.cartService.selectedDelivery.set(null);
            this.router.navigateByUrl('/checkout/success');
          } else {
            throw new Error('Order creation failed');
          }
        } else if (result.error) {
          throw new Error(result.error.message);
        } else {
          throw new Error('Something went wrong');
        }
      }
    } catch (error: any) {
      this.snackbarService.error(error.message || 'Something wend wrong');

      stepper.previous();
    } finally {
      this.loading = false;
    }
  }

  private async createOrderModel(): Promise<OrderToCreate> {
    const cart = this.cartService.cart();
    const shippingAddress = (await this.getAddressFromStripeAddress()) as ShippingAddress;
    const card = this.confirmationToken?.payment_method_preview.card;

    if (!cart?.id || !cart.deliveryMethodId || !card || !shippingAddress) {
      throw new Error('Payment creating order');
    }

    return {
      cartId: cart.id,
      paymentSummary: {
        last4: +card.last4,
        brand: card.brand,
        expMonth: card.exp_month,
        expYear: card.exp_year,
      },
      deliveryMethodId: cart.deliveryMethodId,
      shippingAddress,
    };
  }

  private handleAddressChange = (event: StripeAddressElementChangeEvent): void => {
    this.completionStatus.update(state => {
      state.address = event.complete;

      return state;
    });
  };

  private handlePaymentChange = (event: StripePaymentElementChangeEvent): void => {
    this.completionStatus.update(state => {
      state.card = event.complete;

      return state;
    });
  };

  private async getAddressFromStripeAddress(): Promise<Address | ShippingAddress | null> {
    const result = await this.stripeAddressElement?.getValue();
    const address = result?.value.address;

    if (!address) {
      return null;
    }

    return {
      name: result.value.name,
      line1: address.line1,
      line2: address.line2 || undefined,
      city: address.city,
      country: address.country,
      state: address.state,
      postalCode: address.postal_code,
    };
  }
}
