import { Component, inject, OnInit } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import { MatDivider } from '@angular/material/divider';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { Product } from '../../../shared/models/product';
import { ShopService } from '../../../core/services/shop.service';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CurrencyPipe, MatButton, MatIcon, MatFormField, MatInput, MatLabel, MatDivider],
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.scss',
})
export class ProductDetailsComponent implements OnInit {
  private shopService: ShopService = inject(ShopService);
  private activatedRoute: ActivatedRoute = inject(ActivatedRoute);

  public product?: Product;

  private loadProduct(): void {
    const productId = this.activatedRoute.snapshot.paramMap.get('id');

    if (!productId) return;

    this.shopService.getProduct(Number(productId)).subscribe({
      next: product => (this.product = product),
      error: error => console.log(error),
    });
  }

  public ngOnInit(): void {
    this.loadProduct();
  }
}
