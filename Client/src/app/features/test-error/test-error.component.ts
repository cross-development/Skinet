import { Component, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatButton } from '@angular/material/button';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-test-error',
  standalone: true,
  imports: [MatButton],
  templateUrl: './test-error.component.html',
  styleUrl: './test-error.component.scss',
})
export class TestErrorComponent {
  private httpClient: HttpClient = inject(HttpClient);

  public validationErrors?: string[];

  public get400BadRequestError(): void {
    this.httpClient.get(environment.apiUrl + 'buggy/bad-request').subscribe({
      next: response => console.log(response),
      error: error => console.log(error),
    });
  }

  public get400ValidationError(): void {
    this.httpClient.post(environment.apiUrl + 'buggy/validation-error', {}).subscribe({
      next: response => console.log(response),
      error: error => (this.validationErrors = error),
    });
  }

  public get401UnauthorizedError(): void {
    this.httpClient.get(environment.apiUrl + 'buggy/unauthorized').subscribe({
      next: response => console.log(response),
      error: error => console.log(error),
    });
  }

  public get404NotFoundError(): void {
    this.httpClient.get(environment.apiUrl + 'buggy/not-found').subscribe({
      next: response => console.log(response),
      error: error => console.log(error),
    });
  }

  public get500InternalError(): void {
    this.httpClient.get(environment.apiUrl + 'buggy/internal-error').subscribe({
      next: response => console.log(response),
      error: error => console.log(error),
    });
  }
}
