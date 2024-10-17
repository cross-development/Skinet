import { Component, inject, OnDestroy, OnInit, signal, Signal, WritableSignal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { MatButton } from '@angular/material/button';
import { MatStepperModule } from '@angular/material/stepper';
import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { MatCheckboxChange, MatCheckboxModule } from '@angular/material/checkbox';
import { firstValueFrom } from 'rxjs';
import {
  StripeAddressElement,
  StripePaymentElement,
  StripeAddressElementChangeEvent,
  StripePaymentElementChangeEvent,
} from '@stripe/stripe-js';
import { CartService } from '../../core/services/cart.service';
import { StripeService } from '../../core/services/stripe.service';
import { AccountService } from '../../core/services/account.service';
import { SnackbarService } from '../../core/services/snackbar.service';
import { CheckoutReviewComponent } from './checkout-review/checkout-review.component';
import { CheckoutDeliveryComponent } from './checkout-delivery/checkout-delivery.component';
import { Address } from '../../shared/models/user';
import { ProductTotals } from '../../shared/models/productTotals';
import { CompletionStatus } from '../../shared/models/completionStatus';
import { OrderSummaryComponent } from '../../shared/components/order-summary/order-summary.component';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    RouterLink,
    CurrencyPipe,
    MatButton,
    MatStepperModule,
    MatCheckboxModule,
    OrderSummaryComponent,
    CheckoutReviewComponent,
    CheckoutDeliveryComponent,
  ],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss',
})
export class CheckoutComponent implements OnInit, OnDestroy {
  private cartService: CartService = inject(CartService);
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
      const address = await this.getAddressFromStripeAddress();

      address && firstValueFrom(this.accountService.updateAddress(address));
    }

    if (event.selectedIndex == 2) {
      await firstValueFrom(this.stripeService.createOrUpdatePaymentIntent());
    }
  }

  public handleDeliveryChange(event: boolean): void {
    this.completionStatus.update(state => {
      state.delivery = event;

      return state;
    });
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

  private async getAddressFromStripeAddress(): Promise<Address | null> {
    const result = await this.stripeAddressElement?.getValue();
    const address = result?.value.address;

    if (!address) {
      return null;
    }

    return {
      line1: address.line1,
      line2: address.line2 || undefined,
      city: address.city,
      country: address.country,
      state: address.state,
      postalCode: address.postal_code,
    };
  }
}
