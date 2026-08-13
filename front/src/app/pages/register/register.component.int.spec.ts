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
import { RegisterRequest } from '../../core/models/registerRequest.interface';
import { AuthService } from '../../core/service/auth.service';
import { RegisterComponent } from './register.component';

describe('RegisterComponent Integration tests', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let debugElement: DebugElement;
  let httpTestingController: HttpTestingController;
  let router: Router;

  const registerApiUrl = '/api/auth/register';

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
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        provideNoopAnimations(),
        AuthService,
      ],
    }).compileComponents();

    httpTestingController = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);

    jest.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement;

    fixture.detectChanges();
  });

  afterEach(() => {
    httpTestingController.verify();
    jest.clearAllMocks();
  });

  it('should POST register request and redirect to /login on success', async () => {
    component.form.setValue(mockRegisterRequest);
    fixture.detectChanges();

    const submitButton = debugElement.query(By.css('button[type="submit"]'));
    submitButton.nativeElement.click();

    const req = httpTestingController.expectOne(registerApiUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockRegisterRequest);

    req.flush(null);

    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should handle HTTP error, display error message in DOM and not navigate', () => {
    component.form.setValue(mockRegisterRequest);
    fixture.detectChanges();

    const submitButton = debugElement.query(By.css('button[type="submit"]'));
    submitButton.nativeElement.click();

    const req = httpTestingController.expectOne(registerApiUrl);
    expect(req.request.method).toBe('POST');

    req.flush('Email already exists', {
      status: 400,
      statusText: 'Bad Request',
    });

    fixture.detectChanges();

    const errorMessage = debugElement.query(
      By.css('[data-testid="error-message"]'),
    );
    expect(errorMessage).toBeTruthy();
    expect(errorMessage.nativeElement.textContent.trim()).toBe(
      'An error occurred',
    );
    expect(component.onError).toBe(true);
    expect(router.navigate).not.toHaveBeenCalled();
  });
});
