import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, Subscription } from 'rxjs';
import { Product } from '../../shared/models/product';
import { Pagination } from '../../shared/models/pagination';

@Injectable({
  providedIn: 'root',
})
export class ShopService {
  private baseUrl: string = 'https://localhost:5001/api/';
  private httpClient: HttpClient = inject(HttpClient);

  public types: string[] = [];
  public brands: string[] = [];

  public getProducts(brands?: string[], types?: string[], sort?: string): Observable<Pagination<Product>> {
    let params = new HttpParams();

    params = params.append('pageSize', 20);

    if (brands && brands.length > 0) {
      params = params.append('brands', brands.join(','));
    }

    if (types && types.length > 0) {
      params = params.append('types', types.join(','));
    }

    if (sort) {
      params = params.append('sort', sort);
    }

    return this.httpClient.get<Pagination<Product>>(this.baseUrl + 'products', { params });
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
