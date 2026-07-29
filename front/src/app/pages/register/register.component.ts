import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  RegisterForm,
  RegisterRequest,
} from '../../core/models/registerRequest.interface';
import { AuthService } from '../../core/service/auth.service';
import { MaterialModule } from '../../shared/material.module';
@Component({
  selector: 'app-register',
  imports: [CommonModule, MaterialModule, FlexLayoutModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  public hide = true;
  public onError = false;

  public form: FormGroup<RegisterForm> = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    firstName: [
      '',
      [Validators.required, Validators.min(3), Validators.max(20)],
    ],
    lastName: [
      '',
      [Validators.required, Validators.min(3), Validators.max(20)],
    ],
    password: [
      '',
      [Validators.required, Validators.min(3), Validators.max(40)],
    ],
  });

  public submit(): void {
    const registerRequest: RegisterRequest = this.form.getRawValue();
    this.authService
      .register(registerRequest)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.router.navigate(['/login']),
        error: (_error: HttpErrorResponse) => (this.onError = true),
      });
  }
}
