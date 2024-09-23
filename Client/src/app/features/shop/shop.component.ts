import { Component, OnInit } from '@angular/core';
import { ShopService } from '../../core/services/shop.service';
import { Product } from '../../shared/models/product';
import { ProductItemComponent } from './product-item/product-item.component';

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [ProductItemComponent],
  templateUrl: './shop.component.html',
  styleUrl: './shop.component.scss',
})
export class ShopComponent implements OnInit {
  public products: Product[] = [];

  constructor(private readonly shopService: ShopService) {}

  public ngOnInit(): void {
    this.initializeShop();
  }

  private initializeShop(): void {
    this.shopService.getTypes();
    this.shopService.getBrands();
    this.shopService.getProducts().subscribe({
      next: response => (this.products = response.data),
      error: error => console.log(error),
    });
  }
}
