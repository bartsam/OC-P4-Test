import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  LoginForm,
  LoginRequest,
} from '../../core/models/loginRequest.interface';
import { SessionInformation } from '../../core/models/sessionInformation.interface';
import { AuthService } from '../../core/service/auth.service';
import { SessionService } from '../../core/service/session.service';
import { MaterialModule } from '../../shared/material.module';

@Component({
  selector: 'app-login',
  imports: [CommonModule, MaterialModule, FlexLayoutModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private sessionService = inject(SessionService);
  private destroyRef = inject(DestroyRef);

  public hide = true;
  public onError = false;

  public form: FormGroup<LoginForm> = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.min(3)]],
  });

  public submit(): void {
    const loginRequest: LoginRequest = this.form.getRawValue();
    this.authService
      .login(loginRequest)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: SessionInformation) => {
          this.sessionService.logIn(response);
          this.router.navigate(['/sessions']);
        },
        error: (_error: HttpErrorResponse) => (this.onError = true),
      });
  }
}
