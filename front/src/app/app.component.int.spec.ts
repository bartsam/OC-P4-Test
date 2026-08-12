import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { expect, jest } from '@jest/globals';

import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { SessionInformation } from './core/models/sessionInformation.interface';
import { SessionService } from './core/service/session.service';

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let app: AppComponent;
  let debugElement: DebugElement;
  let httpTestingController: HttpTestingController;
  let sessionService: SessionService;
  let router: Router;

  const mockSessionInformation: SessionInformation = {
    token: 'fake-jwt-token',
    type: 'Bearer',
    id: 1,
    username: 'john.doe@example.com',
    firstName: 'John',
    lastName: 'Doe',
    admin: true,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        SessionService,
      ],
    }).compileComponents();

    httpTestingController = TestBed.inject(HttpTestingController);
    sessionService = TestBed.inject(SessionService);
    router = TestBed.inject(Router);

    jest.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture = TestBed.createComponent(AppComponent);
    app = fixture.componentInstance;
    debugElement = fixture.debugElement;
  });

  afterEach(() => {
    httpTestingController.verify();
    sessionService.logOut();
    jest.clearAllMocks();
  });

  describe('when the user is log in', () => {
    beforeEach(() => {
      sessionService.logIn(mockSessionInformation);
      fixture.detectChanges();
    });

    it('should show the Sessions, Account and Logout links', () => {
      expect(
        debugElement.query(By.css('[data-testid="sessions-link"]')),
      ).toBeTruthy();
      expect(
        debugElement.query(By.css('[data-testid="account-link"]')),
      ).toBeTruthy();
      expect(
        debugElement.query(By.css('[data-testid="logout-link"]')),
      ).toBeTruthy();
    });

    it('should hide the Login and Register links', () => {
      const loginLink = debugElement.query(
        By.css('[data-testid="login-link"]'),
      );
      const registerLink = debugElement.query(
        By.css('[data-testid="register-link"]'),
      );
      expect(loginLink).toBeFalsy();
      expect(registerLink).toBeFalsy();
    });

    it('should log out the user and redirect to home when clicking Logout', () => {
      debugElement
        .query(By.css('[data-testid="logout-link"]'))
        .nativeElement.click();
      fixture.detectChanges();

      expect(sessionService.isLogged).toBe(false);
      expect(router.navigate).toHaveBeenCalledWith(['']);
      expect(
        debugElement.query(By.css('[data-testid="logout-link"]')),
      ).toBeFalsy();
      expect(
        debugElement.query(By.css('[data-testid="login-link"]')),
      ).toBeTruthy();
    });
  });

  describe('when the user is logged out', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should show the Login and Register links', () => {
      expect(
        debugElement.query(By.css('[data-testid="login-link"]')),
      ).toBeTruthy();
      expect(
        debugElement.query(By.css('[data-testid="register-link"]')),
      ).toBeTruthy();
    });

    it('should hide the Sessions, Account and Logout links', () => {
      expect(
        debugElement.query(By.css('[data-testid="sessions-link"]')),
      ).toBeFalsy();
      expect(
        debugElement.query(By.css('[data-testid="account-link"]')),
      ).toBeFalsy();
      expect(
        debugElement.query(By.css('[data-testid="logout-link"]')),
      ).toBeFalsy();
    });
  });
});
