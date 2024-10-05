import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [MatIcon, MatButton, RouterLink],
  templateUrl: './empty-state.component.html',
  styleUrl: './empty-state.component.scss',
})
export class EmptyStateComponent {}
