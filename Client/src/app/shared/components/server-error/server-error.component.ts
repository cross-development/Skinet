import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { MatCard } from '@angular/material/card';

@Component({
  selector: 'app-server-error',
  standalone: true,
  imports: [MatCard],
  templateUrl: './server-error.component.html',
  styleUrl: './server-error.component.scss',
})
export class ServerErrorComponent {
  public error?: HttpErrorResponse & { details: string };

  constructor(private readonly router: Router) {
    const navigation = this.router.getCurrentNavigation();

    this.error = navigation?.extras.state?.['error'];
  }
}
