import { Component } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidatorFn,
  ValidationErrors,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';

import { AuthService } from '../../core/services/auth.service';

export const passwordMatchValidator: ValidatorFn = (
  group: AbstractControl
): ValidationErrors | null => {
  const pass = group.get('password')?.value;
  const confirm = group.get('confirmPassword')?.value;
  return pass === confirm ? null : { mismatch: true };
};

@Component({
  selector: 'app-register-page',
  standalone: true,
  templateUrl: './register-page.component.html',
  styleUrl: './register-page.component.css',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
})
export class RegisterPageComponent {
  isSubmitting = false;
  errorMessage = '';

  registerForm = new FormGroup(
    {
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
      confirmPassword: new FormControl('', {
        validators: [Validators.required],
        updateOn: 'blur',
      }),
    },
    { validators: passwordMatchValidator }
  );

  constructor(private authService: AuthService, private router: Router) {}

  handleRegister(): void {
    this.registerForm.markAllAsTouched();
    if (this.registerForm.invalid) return;

    const { login, password, confirmPassword } = this.registerForm.value;
    if (!login || !password || !confirmPassword) return;

    this.isSubmitting = true;
    this.errorMessage = '';

    this.authService
      .register(login.trim(), password.trim(), confirmPassword.trim())
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: () =>
          this.router.navigate(['/'], {
            state: { message: 'You have registered successfully' },
          }),
        error: (err) => {
          this.errorMessage = err?.error ?? 'Unexpected error';
          console.error('register error:', err);
        },
      });
  }

  shouldShowError(
    controlName: 'login' | 'password' | 'confirmPassword'
  ): boolean {
    const control = this.registerForm.get(controlName);
    if (!control) return false;

    const basicInvalid = control.invalid && control.touched;

    if (controlName === 'confirmPassword' && control.touched) {
      const mismatch = this.registerForm.hasError('mismatch');
      if (mismatch && !control.hasError('required')) return true;
    }
    return basicInvalid;
  }
}
