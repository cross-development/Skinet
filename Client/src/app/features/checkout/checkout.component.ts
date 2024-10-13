import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButton } from '@angular/material/button';
import { MatStepperModule } from '@angular/material/stepper';
import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { MatCheckboxChange, MatCheckboxModule } from '@angular/material/checkbox';
import { firstValueFrom } from 'rxjs';
import { StripeAddressElement, StripePaymentElement } from '@stripe/stripe-js';
import { StripeService } from '../../core/services/stripe.service';
import { AccountService } from '../../core/services/account.service';
import { SnackbarService } from '../../core/services/snackbar.service';
import { CheckoutDeliveryComponent } from './checkout-delivery/checkout-delivery.component';
import { Address } from '../../shared/models/user';
import { OrderSummaryComponent } from '../../shared/components/order-summary/order-summary.component';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    RouterLink,
    MatButton,
    MatStepperModule,
    MatCheckboxModule,
    OrderSummaryComponent,
    CheckoutDeliveryComponent,
  ],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss',
})
export class CheckoutComponent implements OnInit, OnDestroy {
  private stripeService: StripeService = inject(StripeService);
  private accountService: AccountService = inject(AccountService);
  private snackbarService: SnackbarService = inject(SnackbarService);

  public stripeAddressElement?: StripeAddressElement;
  public stripePaymentElement?: StripePaymentElement;
  public saveAddress: boolean = false;

  public async ngOnInit(): Promise<void> {
    try {
      this.stripeAddressElement = await this.stripeService.createAddressElement();
      this.stripeAddressElement?.mount('#address-element');

      this.stripePaymentElement = await this.stripeService.createPaymentElement();
      this.stripePaymentElement?.mount('#payment-element');
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
