import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { expect, jest } from '@jest/globals';

import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { RegisterRequest } from '../../core/models/registerRequest.interface';
import { AuthService } from '../../core/service/auth.service';
import { RegisterComponent } from './register.component';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let debugElement: DebugElement;
  let router: Router;

  const mockAuthService: jest.Mocked<Pick<AuthService, 'register'>> = {
    register: jest.fn<AuthService['register']>(),
  };

  const mockRegisterRequest: RegisterRequest = {
    email: 'john.doe@test.com',
    firstName: 'John',
    lastName: 'Doe',
    password: 'azert',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterComponent],
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
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

  it('should register the user and navigate to "/login" when succeeds', () => {
    mockAuthService.register.mockReturnValue(of(undefined));

    component.form.setValue(mockRegisterRequest);
    fixture.detectChanges();

    const submitButton = debugElement.query(By.css('button[type="submit"]'));
    submitButton.nativeElement.click();
    fixture.detectChanges();

    expect(mockAuthService.register).toHaveBeenCalledWith(mockRegisterRequest);

    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should display an error message and not navigate when registration fail', () => {
    mockAuthService.register.mockReturnValue(
      throwError(() => new Error('Email already used')),
    );

    component.form.setValue(mockRegisterRequest);
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
    expect(router.navigate).not.toHaveBeenCalled();
    expect(component.onError).toBe(true);
  });

  it('should disable the submit button when a required field is missing', () => {
    component.form.setValue({ ...mockRegisterRequest, email: '' });
    fixture.detectChanges();

    const submitButton = debugElement.query(By.css('button[type="submit"]'));

    expect(submitButton.nativeElement.disabled).toBe(true);
  });

  it('should disable the submit button when the email format is invalid', () => {
    component.form.setValue({ ...mockRegisterRequest, email: 'not-an-email' });
    fixture.detectChanges();

    const submitButton = debugElement.query(By.css('button[type="submit"]'));

    expect(submitButton.nativeElement.disabled).toBe(true);
  });
});
