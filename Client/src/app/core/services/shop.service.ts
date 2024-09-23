import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../../shared/models/product';
import { Pagination } from '../../shared/models/pagination';

@Injectable({
  providedIn: 'root',
})
export class ShopService {
  private baseUrl: string = 'https://localhost:5001/api/';

  constructor(private readonly httpClient: HttpClient) {}

  public getProducts(): Observable<Pagination<Product>> {
    return this.httpClient.get<Pagination<Product>>(this.baseUrl + 'products?pageSize=20');
  }
}
