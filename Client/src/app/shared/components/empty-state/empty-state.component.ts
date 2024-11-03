import { Component, inject, input, OnInit, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';
import { BusyService } from '../../../core/services/busy.service';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [MatIcon, MatButton, RouterLink],
  templateUrl: './empty-state.component.html',
  styleUrl: './empty-state.component.scss',
})
export class EmptyStateComponent implements OnInit {
  private busyService: BusyService = inject(BusyService);

  public message = input.required<string>();
  public icon = input.required<string>();
  public actionText = input.required<string>();
  public action = output<void>();
  public busyRequestCount?: number;

  public ngOnInit(): void {
    this.busyRequestCount = this.busyService.busyRequestCount;
  }

  public onAction(): void {
    this.action.emit();
  }
}
