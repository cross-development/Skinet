import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, map, Observable } from 'rxjs';
import {
  ConfirmationToken,
  ConfirmationTokenResult,
  loadStripe,
  PaymentIntentResult,
  Stripe,
  StripeAddressElement,
  StripeAddressElementOptions,
  StripeElements,
  StripePaymentElement,
} from '@stripe/stripe-js';
import { CartService } from './cart.service';
import { AccountService } from './account.service';
import { Cart } from '../../shared/models/cart';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class StripeService {
  private stripeElements?: StripeElements;
  private addressElement?: StripeAddressElement;
  private paymentElement?: StripePaymentElement;
  private stripePromise: Promise<Stripe | null>;
  private httpClient: HttpClient = inject(HttpClient);
  private cartService: CartService = inject(CartService);
  private accountService: AccountService = inject(AccountService);

  constructor() {
    this.stripePromise = loadStripe(environment.stripePublicKey);
  }

  public getStripeInstance(): Promise<Stripe | null> {
    return this.stripePromise;
  }

  public async initializeStripeElements(): Promise<StripeElements | undefined> {
    if (!this.stripeElements) {
      const stripe = await this.getStripeInstance();

      if (stripe) {
        const cart = await firstValueFrom(this.createOrUpdatePaymentIntent());

        this.stripeElements = stripe.elements({
          clientSecret: cart.clientSecret,
          appearance: { labels: 'floating' },
        });
      } else {
        throw new Error('Stripe has not been loaded');
      }
    }

    return this.stripeElements;
  }

  public async createAddressElement(): Promise<StripeAddressElement | undefined> {
    if (!this.addressElement) {
      const elements = await this.initializeStripeElements();

      if (elements) {
        const user = this.accountService.currentUser();

        const defaultValues: StripeAddressElementOptions['defaultValues'] = {};

        if (user) {
          defaultValues.name = `${user.firstName} ${user.lastName}`;
        }

        if (user?.address) {
          defaultValues.address = {
            line1: user.address.line1,
            line2: user.address.line2,
            city: user.address.city,
            state: user.address.state,
            country: user.address.country,
            postal_code: user.address.postalCode,
          };
        }

        const options: StripeAddressElementOptions = {
          mode: 'shipping',
          defaultValues,
        };

        this.addressElement = elements.create('address', options);
      }
    } else {
      throw new Error('Elements instance has not been loaded');
    }

    return this.addressElement;
  }

  public async createPaymentElement(): Promise<StripePaymentElement> {
    if (!this.paymentElement) {
      const elements = await this.initializeStripeElements();

      if (elements) {
        this.paymentElement = elements.create('payment');
      } else {
        throw new Error('Elements instance has not been initialized');
      }
    }

    return this.paymentElement;
  }

  public async confirmPayment(confirmationToken: ConfirmationToken): Promise<PaymentIntentResult> {
    const stripe = await this.getStripeInstance();
    const elements = await this.initializeStripeElements();
    const result = await elements?.submit();

    if (result?.error) {
      throw new Error(result.error.message);
    }

    const clientSecret = this.cartService.cart()?.clientSecret;

    if (stripe && clientSecret) {
      return await stripe.confirmPayment({
        clientSecret,
        confirmParams: { confirmation_token: confirmationToken.id },
        redirect: 'if_required',
      });
    } else {
      throw new Error('Unable to load Stripe');
    }
  }

  public createOrUpdatePaymentIntent() {
    const cart = this.cartService.cart();
    const hasClientSecret = !!cart?.clientSecret;

    if (!cart) {
      throw new Error('Problem with cart');
    }

    return this.httpClient.post<Cart>(environment.apiUrl + 'payment/' + cart.id, {}).pipe(
      map(async cart => {
        if (hasClientSecret) {
          return cart;
        }

        this.cartService.setCart(cart);

        return cart;
      }),
    );
  }

  public async createConfirmationToken(): Promise<ConfirmationTokenResult> {
    const stripe = await this.getStripeInstance();
    const elements = await this.initializeStripeElements();
    const result = await elements?.submit();

    if (result?.error) {
      throw new Error(result.error.message);
    }

    if (stripe && elements) {
      return await stripe.createConfirmationToken({ elements });
    } else {
      throw new Error('Stripe not available');
    }
  }

  public disposeElements(): void {
    this.stripeElements = undefined;
    this.addressElement = undefined;
    this.paymentElement = undefined;
  }
}
