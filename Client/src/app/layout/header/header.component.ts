import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { MatBadge } from '@angular/material/badge';
import { MatButton } from '@angular/material/button';
import { MatDivider } from '@angular/material/divider';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { BusyService } from '../../core/services/busy.service';
import { CartService } from '../../core/services/cart.service';
import { AccountService } from '../../core/services/account.service';
import { User } from '../../shared/models/user';
import { IsAdminDirective } from '../../shared/directives/is-admin.directive';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    MatIcon,
    MatButton,
    MatBadge,
    RouterLink,
    RouterLinkActive,
    MatProgressBar,
    MatMenuTrigger,
    MatMenu,
    MatDivider,
    MatMenuItem,
    IsAdminDirective,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  private router: Router = inject(Router);
  private busyService: BusyService = inject(BusyService);
  private cartService: CartService = inject(CartService);
  private accountService: AccountService = inject(AccountService);

  public loading: boolean = false;
  public itemCount: number | undefined;
  public currentUser: User | null;

  constructor() {
    this.loading = this.busyService.loading;
    this.itemCount = this.cartService.itemCount();
    this.currentUser = this.accountService.currentUser();
  }

  public logout(): void {
    this.accountService.logout().subscribe({
      next: () => {
        this.accountService.currentUser.set(null);
        this.router.navigateByUrl('/');
      },
    });
  }
}
