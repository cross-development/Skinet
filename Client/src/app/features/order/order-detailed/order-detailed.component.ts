import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { MatButton } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { OrderService } from '../../../core/services/order.service';
import { Order } from '../../../shared/models/order';
import { AddressPipe } from '../../../shared/pipes/address.pipe';
import { PaymentCardPipe } from '../../../shared/pipes/payment-card.pipe';

@Component({
  selector: 'app-order-detailed',
  standalone: true,
  imports: [DatePipe, CurrencyPipe, AddressPipe, PaymentCardPipe, RouterLink, MatCardModule, MatButton],
  templateUrl: './order-detailed.component.html',
  styleUrl: './order-detailed.component.scss',
})
export class OrderDetailedComponent implements OnInit {
  private orderService: OrderService = inject(OrderService);
  private activatedRoute: ActivatedRoute = inject(ActivatedRoute);

  public order?: Order;

  public ngOnInit(): void {
    this.loadOrder();
  }

  public loadOrder() {
    const id = this.activatedRoute.snapshot.paramMap.get('id');

    if (!id) {
      return;
    }

    this.orderService.getOrderDetails(+id).subscribe({
      next: order => (this.order = order),
    });
  }
}
