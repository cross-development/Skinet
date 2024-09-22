import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { HeaderComponent } from './layout/header/header.component';
import { Product } from './shared/models/product';
import { Pagination } from './shared/models/pagination';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  public baseUrl = 'https://localhost:5001/api/';
  public title = 'Client';
  public products: Product[] = [];

  constructor(private readonly httpClient: HttpClient) {}

  public ngOnInit(): void {
    this.httpClient.get<Pagination<Product>>(this.baseUrl + 'products').subscribe({
      next: response => (this.products = response.data),
      error: error => {},
      complete: () => {},
    });
  }
}
