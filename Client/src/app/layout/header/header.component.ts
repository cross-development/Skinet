import { Component, inject, Signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { MatBadge } from '@angular/material/badge';
import { MatButton } from '@angular/material/button';
import { MatProgressBar } from '@angular/material/progress-bar';
import { BusyService } from '../../core/services/busy.service';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MatIcon, MatButton, MatBadge, RouterLink, RouterLinkActive, MatProgressBar],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  private busyService: BusyService = inject(BusyService);
  private cartService: CartService = inject(CartService);

  public loading: boolean = this.busyService.loading;
  public itemCount: Signal<number | undefined> = this.cartService.itemCount;
}
