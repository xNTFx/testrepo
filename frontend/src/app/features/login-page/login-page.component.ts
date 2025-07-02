import { Component } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';

import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.css',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
})
export class LoginPageComponent {
  isSubmitting = false;
  errorMessage = '';

  loginForm = new FormGroup({
    login: new FormControl('', {
      validators: [
        Validators.required,
        Validators.pattern('^[a-zA-Z0-9_-]{3,30}$'),
      ],
      updateOn: 'blur',
    }),
    password: new FormControl('', {
      validators: [
        Validators.required,
        Validators.pattern(
          '^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[*.!@#$%^&(){}\\[\\]:;<>,.?/~_+\\-=|]).{8,32}$'
        ),
      ],
      updateOn: 'blur',
    }),
  });

  constructor(private authService: AuthService, private router: Router) {}

  handleLogin() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const { login, password } = this.loginForm.value;
    if (!login || !password) return;

    this.isSubmitting = true;
    this.errorMessage = '';

    this.authService
      .login(login.trim(), password.trim())
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: () =>
          this.router.navigate(['/'], {
            state: { message: 'you have logged in successfully' },
          }),
        error: (err) => {
          this.errorMessage = err?.error ?? 'unexpected error';
          console.error('login fail:', err);
        },
      });
  }

  shouldShowError(controlName: 'login' | 'password'): boolean {
    const control = this.loginForm.get(controlName);
    return !!control && control.invalid && control.touched;
  }
}
