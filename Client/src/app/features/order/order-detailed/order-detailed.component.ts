import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { MatButton } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { OrderService } from '../../../core/services/order.service';
import { AdminService } from '../../../core/services/admin.service';
import { AccountService } from '../../../core/services/account.service';
import { Order } from '../../../shared/models/order';
import { AddressPipe } from '../../../shared/pipes/address.pipe';
import { PaymentCardPipe } from '../../../shared/pipes/payment-card.pipe';

@Component({
  selector: 'app-order-detailed',
  standalone: true,
  imports: [DatePipe, CurrencyPipe, AddressPipe, PaymentCardPipe, MatCardModule, MatButton],
  templateUrl: './order-detailed.component.html',
  styleUrl: './order-detailed.component.scss',
})
export class OrderDetailedComponent implements OnInit {
  private router: Router = inject(Router);
  private orderService: OrderService = inject(OrderService);
  private adminService: AdminService = inject(AdminService);
  private activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private accountService: AccountService = inject(AccountService);

  public order?: Order;
  public buttonText = this.accountService.isAdmin() ? 'Return to admin' : 'Return to orders';

  public ngOnInit(): void {
    this.loadOrder();
  }

  public loadOrder(): void {
    const id = this.activatedRoute.snapshot.paramMap.get('id');

    if (!id) {
      return;
    }

    const loadOrderData = this.accountService.isAdmin()
      ? this.adminService.getOrder(+id)
      : this.orderService.getOrderDetails(+id);

    loadOrderData.subscribe({
      next: order => (this.order = order),
    });
  }

  public onReturnClick(): void {
    this.accountService.isAdmin()
      ? this.router.navigateByUrl('/admin')
      : this.router.navigateByUrl('/orders');
  }
}
