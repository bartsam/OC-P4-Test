import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter, Router } from '@angular/router';
import { expect, jest } from '@jest/globals';
import { RegisterRequest } from '../../core/models/registerRequest.interface';
import { AuthService } from '../../core/service/auth.service';
import { RegisterComponent } from './register.component';

describe('RegisterComponent Unit tests', () => {
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
    password: 'azerty',
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
    jest.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should be invalid when empty and disable submit button', () => {
    expect(component.form.valid).toBe(false);

    const submitButton = debugElement.query(By.css('button[type="submit"]'));
    expect(submitButton.nativeElement.disabled).toBe(true);
  });

  it('should be valid when filled correctly and enable submit button', () => {
    component.form.setValue(mockRegisterRequest);
    fixture.detectChanges();

    expect(component.form.valid).toBe(true);
    const submitButton = debugElement.query(By.css('button[type="submit"]'));
    expect(submitButton.nativeElement.disabled).toBe(false);
  });

  it('should disable submit button when email format is invalid', () => {
    component.form.setValue({
      ...mockRegisterRequest,
      email: 'invalid-email',
    });
    fixture.detectChanges();

    expect(component.form.valid).toBe(false);
    expect(component.form.controls.email.errors?.['email']).toBeTruthy();

    const submitButton = debugElement.query(By.css('button[type="submit"]'));
    expect(submitButton.nativeElement.disabled).toBe(true);
  });

  it('should disable submit button when a required field is missing', () => {
    component.form.setValue({
      ...mockRegisterRequest,
      firstName: '',
    });
    fixture.detectChanges();

    expect(component.form.valid).toBe(false);

    const submitButton = debugElement.query(By.css('button[type="submit"]'));
    expect(submitButton.nativeElement.disabled).toBe(true);
  });
});
