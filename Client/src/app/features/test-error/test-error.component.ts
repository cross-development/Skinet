import { Component, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'app-test-error',
  standalone: true,
  imports: [MatButton],
  templateUrl: './test-error.component.html',
  styleUrl: './test-error.component.scss',
})
export class TestErrorComponent {
  private baseUrl: string = 'https://localhost:5001/api/';
  private httpClient: HttpClient = inject(HttpClient);

  public validationErrors?: string[];

  public get400BadRequestError(): void {
    this.httpClient.get(this.baseUrl + 'buggy/bad-request').subscribe({
      next: response => console.log(response),
      error: error => console.log(error),
    });
  }

  public get400ValidationError(): void {
    this.httpClient.post(this.baseUrl + 'buggy/validation-error', {}).subscribe({
      next: response => console.log(response),
      error: error => (this.validationErrors = error),
    });
  }

  public get401UnauthorizedError(): void {
    this.httpClient.get(this.baseUrl + 'buggy/unauthorized').subscribe({
      next: response => console.log(response),
      error: error => console.log(error),
    });
  }

  public get404NotFoundError(): void {
    this.httpClient.get(this.baseUrl + 'buggy/not-found').subscribe({
      next: response => console.log(response),
      error: error => console.log(error),
    });
  }

  public get500InternalError(): void {
    this.httpClient.get(this.baseUrl + 'buggy/internal-error').subscribe({
      next: response => console.log(response),
      error: error => console.log(error),
    });
  }
}
