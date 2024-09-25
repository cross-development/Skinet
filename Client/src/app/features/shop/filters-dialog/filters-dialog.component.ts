import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatDivider } from '@angular/material/divider';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatListOption, MatSelectionList } from '@angular/material/list';
import { ShopService } from '../../../core/services/shop.service';
import { Filter } from '../../../shared/models/filter';

@Component({
  selector: 'app-filters-dialog',
  standalone: true,
  imports: [MatDivider, MatSelectionList, MatListOption, MatButton, FormsModule],
  templateUrl: './filters-dialog.component.html',
  styleUrl: './filters-dialog.component.scss',
})
export class FiltersDialogComponent {
  private dialogRef: MatDialogRef<FiltersDialogComponent> = inject(MatDialogRef<FiltersDialogComponent>);

  public shopService: ShopService = inject(ShopService);
  public data: Filter = inject(MAT_DIALOG_DATA);
  public selectedBrands: string[] = this.data.selectedBrands;
  public selectedTypes: string[] = this.data.selectedTypes;

  public applyFilters(): void {
    this.dialogRef.close({
      selectedBrands: this.selectedBrands,
      selectedTypes: this.selectedTypes,
    });
  }
}
