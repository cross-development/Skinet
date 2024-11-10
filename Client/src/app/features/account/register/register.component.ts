import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCard } from '@angular/material/card';
import { MatButton } from '@angular/material/button';
import { AccountService } from '../../../core/services/account.service';
import { SnackbarService } from '../../../core/services/snackbar.service';
import { PASSWORD_PATTERN } from '../../../shared/constants/input';
import { TextInputComponent } from '../../../shared/components/text-input/text-input.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, MatCard, MatButton, TextInputComponent],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  private router: Router = inject(Router);
  private formBuilder: FormBuilder = inject(FormBuilder);
  private accountService: AccountService = inject(AccountService);
  private snackbarService: SnackbarService = inject(SnackbarService);

  public validationErrors?: string[];

  public registerForm = this.formBuilder.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.pattern(PASSWORD_PATTERN)]],
  });

  public onSubmit(): void {
    this.accountService.register(this.registerForm.value).subscribe({
      next: () => {
        this.snackbarService.success('Registration successful - you can now login');
        this.router.navigateByUrl('/account/login');
      },
      error: errors => (this.validationErrors = errors),
    });
  }
}
