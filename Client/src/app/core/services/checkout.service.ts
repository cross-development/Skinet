import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, of } from 'rxjs';
import { DeliveryMethod } from '../../shared/models/deliveryMethod';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CheckoutService {
  private httpClient: HttpClient = inject(HttpClient);

  public deliveryMethods: DeliveryMethod[] = [];

  public getDeliveryMethods(): Observable<DeliveryMethod[]> {
    if (this.deliveryMethods.length > 0) {
      return of(this.deliveryMethods);
    }

    return this.httpClient.get<DeliveryMethod[]>(environment.apiUrl + 'payments/delivery-methods').pipe(
      map(methods => {
        this.deliveryMethods = methods.sort((a, b) => b.price - a.price);

        return methods;
      }),
    );
  }
}
