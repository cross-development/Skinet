import { Component, inject, OnInit } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatLabel, MatSelectChange, MatSelectModule } from '@angular/material/select';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { AdminService } from '../../core/services/admin.service';
import { Order } from '../../shared/models/order';
import { OrderParams } from '../../shared/models/orderParams';
import { DialogService } from '../../core/services/dialog.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    RouterLink,
    MatTableModule,
    MatPaginatorModule,
    MatIcon,
    MatLabel,
    MatTooltipModule,
    MatSelectModule,
    MatTabsModule,
    DatePipe,
    CurrencyPipe,
  ],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss',
})
export class AdminComponent implements OnInit {
  private adminService: AdminService = inject(AdminService);
  private dialogService: DialogService = inject(DialogService);

  public statusOptions: string[] = ['All', 'PaymentReceived', 'PaymentMismatch', 'Refund', 'Pending'];
  public displayedColumns: string[] = ['id', 'buyerEmail', 'orderDate', 'total', 'status', 'action'];
  public dataSource = new MatTableDataSource<Order>([]);
  public orderParams: OrderParams = new OrderParams();
  public totalItems: number = 0;

  public ngOnInit(): void {
    this.loadOrders();
  }

  public loadOrders(): void {
    this.adminService.getOrders(this.orderParams).subscribe({
      next: response => {
        if (response.data) {
          this.dataSource.data = response.data;
          this.totalItems = response.count;
        }
      },
    });
  }

  public onPageChange(event: PageEvent): void {
    this.orderParams.pageNumber = event.pageIndex + 1;
    this.orderParams.pageSize = event.pageSize;

    this.loadOrders();
  }

  public onFilterSelect(event: MatSelectChange): void {
    this.orderParams.filter = event.value;
    this.orderParams.pageNumber = 1;

    this.loadOrders();
  }

  public async openConfirmationDialog(id: number): Promise<void> {
    const confirmed = await this.dialogService.confirm(
      'Confirm refund',
      'Are you sure you want to issue this refund? This cannot be undone',
    );

    if (confirmed) {
      this.refundOrder(id);
    }
  }

  private refundOrder(id: number): void {
    this.adminService.refundOrder(id).subscribe({
      next: order => {
        this.dataSource.data = this.dataSource.data.map(o => (o.id === id ? order : o));
      },
    });
  }
}
