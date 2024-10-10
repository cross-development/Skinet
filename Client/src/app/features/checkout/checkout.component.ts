import { Component, inject, OnInit } from '@angular/core';
import { MatStepperModule } from '@angular/material/stepper';
import { OrderSummaryComponent } from '../../shared/components/order-summary/order-summary.component';
import { MatButton } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { StripeService } from '../../core/services/stripe.service';
import { StripeAddressElement } from '@stripe/stripe-js';
import { SnackbarService } from '../../core/services/snackbar.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [OrderSummaryComponent, MatStepperModule, MatButton, RouterLink],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss',
})
export class CheckoutComponent implements OnInit {
  private stripeService: StripeService = inject(StripeService);
  private snackbarService: SnackbarService = inject(SnackbarService);

  public stripeAddressElement?: StripeAddressElement;

  public async ngOnInit(): Promise<void> {
    try {
      this.stripeAddressElement = await this.stripeService.createAddressElement();

      this.stripeAddressElement?.mount('#address-element');
    } catch (error: any) {
      this.snackbarService.error(error.message);
    }
  }
}
