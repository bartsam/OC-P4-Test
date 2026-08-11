import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter, Router } from '@angular/router';
import { expect, jest } from '@jest/globals';
import { AuthService } from '../../core/service/auth.service';
import { SessionService } from '../../core/service/session.service';
import { LoginComponent } from './login.component';

describe('LoginComponent Unit tests', () => {
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

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
        { provide: AuthService, useValue: mockAuthService },
        { provide: SessionService, useValue: mockSessionService },
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
    component.form.setValue({
      email: 'john.doe@test.com',
      password: 'azerty',
    });
    fixture.detectChanges();

    expect(component.form.valid).toBe(true);
    const submitButton = debugElement.query(By.css('button[type="submit"]'));
    expect(submitButton.nativeElement.disabled).toBe(false);
  });

  it('should be invalid if email format is incorrect', () => {
    component.form.setValue({
      email: 'invalid-email',
      password: 'azerty',
    });

    expect(component.form.valid).toBe(false);
    expect(component.form.controls.email.errors?.['email']).toBeTruthy();
  });
});
