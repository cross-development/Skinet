import { Component, inject, OnInit } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import { MatButton } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatListOption, MatSelectionList, MatSelectionListChange } from '@angular/material/list';
import { ShopService } from '../../core/services/shop.service';
import { Product } from '../../shared/models/product';
import { ProductItemComponent } from './product-item/product-item.component';
import { FiltersDialogComponent } from './filters-dialog/filters-dialog.component';

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [
    ProductItemComponent,
    MatButton,
    MatIcon,
    MatMenu,
    MatSelectionList,
    MatListOption,
    MatMenuTrigger,
  ],
  templateUrl: './shop.component.html',
  styleUrl: './shop.component.scss',
})
export class ShopComponent implements OnInit {
  private dialogService: MatDialog = inject(MatDialog);
  private shopService: ShopService = inject(ShopService);

  public products: Product[] = [];
  public selectedBrands: string[] = [];
  public selectedTypes: string[] = [];
  public selectedSort: string = 'name';
  public sortOptions = [
    { name: 'Alphabetical', value: 'name' },
    { name: 'Price: Low-High', value: 'priceAsc' },
    { name: 'Price: High-Low', value: 'priceDesc' },
  ];

  private initializeShop(): void {
    this.shopService.getTypes();
    this.shopService.getBrands();
    this.getProducts();
  }

  private getProducts(): void {
    this.shopService.getProducts(this.selectedBrands, this.selectedTypes, this.selectedSort).subscribe({
      next: response => (this.products = response.data),
      error: error => console.log(error),
    });
  }

  public ngOnInit(): void {
    this.initializeShop();
  }

  public openFiltersDialog(): void {
    const dialogRef = this.dialogService.open(FiltersDialogComponent, {
      minWidth: '500px',
      data: {
        selectedBrands: this.selectedBrands,
        selectedTypes: this.selectedTypes,
      },
    });

    dialogRef.afterClosed().subscribe({
      next: result => {
        if (result) {
          this.selectedBrands = result.selectedBrands;
          this.selectedTypes = result.selectedTypes;

          this.getProducts();
        }
      },
    });
  }

  public onSortChange(event: MatSelectionListChange): void {
    const selectedOption = event.options[0];

    if (selectedOption) {
      this.selectedSort = selectedOption.value;

      this.getProducts();
    }
  }
}
