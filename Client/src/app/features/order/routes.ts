import { Routes } from '@angular/router';
import { OrderComponent } from './order.component';
import { authGuard } from '../../core/guards/auth.guard';
import { OrderDetailedComponent } from './order-detailed/order-detailed.component';

export const orderRoutes: Routes = [
  { path: '', component: OrderComponent, canActivate: [authGuard] },
  { path: ':id', component: OrderDetailedComponent, canActivate: [authGuard] },
];