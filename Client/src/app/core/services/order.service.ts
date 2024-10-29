import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Order, OrderToCreate } from '../../shared/models/order';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private httpClient: HttpClient = inject(HttpClient);

  public orderComplete: boolean = false;

  public createOrder(orderToCreate: OrderToCreate): Observable<Order> {
    return this.httpClient.post<Order>(environment.apiUrl + 'orders', orderToCreate);
  }

  public getOrdersForUser(): Observable<Order[]> {
    return this.httpClient.get<Order[]>(environment.apiUrl + 'orders');
  }

  public getOrderDetails(id: number): Observable<Order> {
    return this.httpClient.get<Order>(environment.apiUrl + 'orders/' + id);
  }
}
