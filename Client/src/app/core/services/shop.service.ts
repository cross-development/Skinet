import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, Subscription } from 'rxjs';
import { Product } from '../../shared/models/product';
import { Pagination } from '../../shared/models/pagination';
import { ShopParams } from '../../shared/models/shopParams';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ShopService {
  private httpClient: HttpClient = inject(HttpClient);

  public types: string[] = [];
  public brands: string[] = [];

  public getProducts(shopParams: ShopParams): Observable<Pagination<Product>> {
    let params = new HttpParams();

    if (shopParams.brands && shopParams.brands.length > 0) {
      params = params.append('brands', shopParams.brands.join(','));
    }

    if (shopParams.types && shopParams.types.length > 0) {
      params = params.append('types', shopParams.types.join(','));
    }

    if (shopParams.sort) {
      params = params.append('sort', shopParams.sort);
    }

    if (shopParams.search) {
      params = params.append('search', shopParams.search);
    }

    params = params.append('pageSize', shopParams.pageSize);
    params = params.append('pageIndex', shopParams.pageNumber);

    return this.httpClient.get<Pagination<Product>>(environment.apiUrl + 'products', { params });
  }

  public getProduct(id: number): Observable<Product> {
    return this.httpClient.get<Product>(environment.apiUrl + 'products/' + id);
  }

  public getTypes(): Subscription | void {
    if (this.types.length > 0) return;

    return this.httpClient.get<string[]>(environment.apiUrl + 'products/types').subscribe({
      next: response => (this.types = response),
    });
  }

  public getBrands(): Subscription | void {
    if (this.brands.length > 0) return;

    return this.httpClient.get<string[]>(environment.apiUrl + 'products/brands').subscribe({
      next: response => (this.brands = response),
    });
  }
}
