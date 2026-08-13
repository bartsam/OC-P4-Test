import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter, Router } from '@angular/router';
import { expect, jest } from '@jest/globals';
import { firstValueFrom } from 'rxjs';
import { SessionInformation } from '../../core/models/sessionInformation.interface';
import { AuthService } from '../../core/service/auth.service';
import { SessionService } from '../../core/service/session.service';
import { LoginComponent } from './login.component';

describe('LoginComponent Integration tests', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let debugElement: DebugElement;
  let httpTestingController: HttpTestingController;
  let sessionService: SessionService;
  let router: Router;

  const loginApiUrl = '/api/auth/login';

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
      imports: [LoginComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        provideNoopAnimations(),
        AuthService,
        SessionService,
      ],
    }).compileComponents();

    httpTestingController = TestBed.inject(HttpTestingController);
    sessionService = TestBed.inject(SessionService);
    router = TestBed.inject(Router);

    jest.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement;
    fixture.detectChanges();
  });

  afterEach(() => {
    httpTestingController.verify();
    jest.clearAllMocks();
  });

  it('should POST login request, update session state and redirect on success', async () => {
    component.form.setValue({
      email: 'john.doe@test.com',
      password: 'azerty',
    });
    fixture.detectChanges();

    const submitButton = debugElement.query(By.css('button[type="submit"]'));
    submitButton.nativeElement.click();

    const req = httpTestingController.expectOne(loginApiUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      email: 'john.doe@test.com',
      password: 'azerty',
    });
    req.flush(mockSessionInformation);

    expect(sessionService.isLogged).toBe(true);
    expect(sessionService.sessionInformation).toEqual(mockSessionInformation);
    await expect(firstValueFrom(sessionService.$isLogged())).resolves.toBe(
      true,
    );

    expect(router.navigate).toHaveBeenCalledWith(['/sessions']);
  });

  it('should handle HTTP 401 error, render error message in DOM and keep user logged out', () => {
    component.form.setValue({
      email: 'john.doe@test.com',
      password: 'wrong-password',
    });
    fixture.detectChanges();

    const submitButton = debugElement.query(By.css('button[type="submit"]'));
    submitButton.nativeElement.click();

    const req = httpTestingController.expectOne(loginApiUrl);
    expect(req.request.method).toBe('POST');
    req.flush('Bad credentials', { status: 401, statusText: 'Unauthorized' });

    fixture.detectChanges();

    const errorMessage = debugElement.query(
      By.css('[data-testid="error-message"]'),
    );
    expect(errorMessage).toBeTruthy();
    expect(errorMessage.nativeElement.textContent.trim()).toBe(
      'An error occurred',
    );

    expect(sessionService.isLogged).toBe(false);
    expect(router.navigate).not.toHaveBeenCalled();
  });
});
