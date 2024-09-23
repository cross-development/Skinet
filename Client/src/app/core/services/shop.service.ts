import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subscription } from 'rxjs';
import { Product } from '../../shared/models/product';
import { Pagination } from '../../shared/models/pagination';

@Injectable({
  providedIn: 'root',
})
export class ShopService {
  private baseUrl: string = 'https://localhost:5001/api/';
  public types: string[] = [];
  public brands: string[] = [];

  constructor(private readonly httpClient: HttpClient) {}

  public getProducts(): Observable<Pagination<Product>> {
    return this.httpClient.get<Pagination<Product>>(this.baseUrl + 'products?pageSize=20');
  }

  public getTypes(): Subscription | void {
    if (this.types.length > 0) return;

    return this.httpClient.get<string[]>(this.baseUrl + 'products/types').subscribe({
      next: response => (this.types = response),
    });
  }

  public getBrands(): Subscription | void {
    if (this.brands.length > 0) return;

    return this.httpClient.get<string[]>(this.baseUrl + 'products/brands').subscribe({
      next: response => (this.brands = response),
    });
  }
}
