import { Directive, effect, inject, TemplateRef, ViewContainerRef } from '@angular/core';
import { AccountService } from '../../core/services/account.service';

@Directive({
  selector: '[appIsAdmin]',
  standalone: true,
})
export class IsAdminDirective {
  private accountService: AccountService = inject(AccountService);
  private templateRef: TemplateRef<any> = inject(TemplateRef);
  private viewContainerRef: ViewContainerRef = inject(ViewContainerRef);

  constructor() {
    effect(() => {
      if (this.accountService.isAdmin()) {
        this.viewContainerRef.createEmbeddedView(this.templateRef);
      } else {
        this.viewContainerRef.clear();
      }
    });
  }
}
