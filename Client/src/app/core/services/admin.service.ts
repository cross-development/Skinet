import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Order } from '../../shared/models/order';
import { Pagination } from '../../shared/models/pagination';
import { OrderParams } from '../../shared/models/orderParams';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private httpClient: HttpClient = inject(HttpClient);

  public getOrders(orderParams: OrderParams): Observable<Pagination<Order>> {
    let params = new HttpParams();

    if (orderParams.filter && orderParams.filter !== 'All') {
      params = params.append('status', orderParams.filter);
    }

    params = params.append('pageIndex', orderParams.pageNumber);
    params = params.append('pageSize', orderParams.pageSize);

    return this.httpClient.get<Pagination<Order>>(environment.apiUrl + 'admin/orders', { params });
  }

  public getOrder(id: number): Observable<Order> {
    return this.httpClient.get<Order>(environment.apiUrl + 'admin/orders/' + id);
  }

  public refundOrder(id: number): Observable<Order> {
    return this.httpClient.post<Order>(environment.apiUrl + 'admin/orders/refund/' + id, {});
  }
}
