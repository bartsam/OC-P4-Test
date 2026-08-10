import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { expect, jest } from '@jest/globals';

import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { SessionInformation } from '../../core/models/sessionInformation.interface';
import { AuthService } from '../../core/service/auth.service';
import { SessionService } from '../../core/service/session.service';
import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let debugElement: DebugElement;
  let router: Router;

  const mockAuthService: jest.Mocked<Pick<AuthService, 'login'>> = {
    login: jest.fn<AuthService['login']>(),
  };

  const mockSessionService: jest.Mocked<Pick<SessionService, 'logIn'>> = {
    logIn: jest.fn<SessionService['logIn']>(),
  };

  const mockSessionInformation: SessionInformation = {
    token: 'fake-token',
    type: 'Bearer',
    id: 1,
    username: 'john.doe@test.com',
    firstName: 'John',
    lastName: 'Doe',
    admin: false,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: mockAuthService },
        { provide: SessionService, useValue: mockSessionService },
      ],
      imports: [
        LoginComponent,
        BrowserAnimationsModule,
        MatCardModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        ReactiveFormsModule,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement;
    router = TestBed.inject(Router);

    jest.spyOn(router, 'navigate').mockResolvedValue(true);
    fixture.detectChanges();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should log the user in and navigate to /sessions when the login succeeds', () => {
    mockAuthService.login.mockReturnValue(of(mockSessionInformation));

    component.form.setValue({
      email: 'john.doe@test.com',
      password: 'azerty',
    });
    fixture.detectChanges();

    const submitButton = debugElement.query(By.css('button[type="submit"]'));
    submitButton.nativeElement.click();
    fixture.detectChanges();

    expect(mockAuthService.login).toHaveBeenCalledWith({
      email: 'john.doe@test.com',
      password: 'azerty',
    });

    expect(mockSessionService.logIn).toHaveBeenCalledWith(
      mockSessionInformation,
    );
    expect(router.navigate).toHaveBeenCalledWith(['/sessions']);
  });

  it('should display an error message when the login fails', () => {
    mockAuthService.login.mockReturnValue(
      throwError(() => new Error('Invalid credentials')),
    );

    component.form.setValue({
      email: 'john.doe@test.com',
      password: 'azerty',
    });
    fixture.detectChanges();

    const submitButton = debugElement.query(By.css('button[type="submit"]'));
    submitButton.nativeElement.click();
    fixture.detectChanges();

    const errorMessage = debugElement.query(
      By.css('[data-testid="error-message"]'),
    );
    expect(errorMessage.nativeElement.textContent).toContain(
      'An error occurred',
    );
    expect(mockSessionService.logIn).not.toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should disable the submit button when the form is empty', () => {
    const submitButton = debugElement.query(By.css('button[type="submit"]'));
    expect(submitButton.nativeElement.disabled).toBe(true);
  });

  it('should enable the submit button when the form is valid', () => {
    component.form.setValue({
      email: 'john.doe@test.com',
      password: 'azerty',
    });
    fixture.detectChanges();

    const submitButton = debugElement.query(By.css('button[type="submit"]'));
    expect(submitButton.nativeElement.disabled).toBe(false);
  });
});
