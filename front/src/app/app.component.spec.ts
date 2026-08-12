import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { expect, jest } from '@jest/globals';
import { of } from 'rxjs';

import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { SessionService } from './core/service/session.service';

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let app: AppComponent;
  let debugElement: DebugElement;
  let router: Router;

  const mockSessionService: jest.Mocked<
    Pick<SessionService, '$isLogged' | 'logOut'>
  > = {
    $isLogged: jest.fn(),
    logOut: jest.fn(),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideRouter([]),
        { provide: SessionService, useValue: mockSessionService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    app = fixture.componentInstance;
    debugElement = fixture.debugElement;
    router = TestBed.inject(Router);

    // jest.spyOn : remplace la méthode navigate() du router par une fausse implémentation
    jest.spyOn(router, 'navigate').mockResolvedValue(true);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create the app', () => {
    expect(app).toBeTruthy();
  });

  describe('when the user is logged in', () => {
    beforeEach(() => {
      mockSessionService.$isLogged.mockReturnValue(of(true));
      fixture.detectChanges();
    });

    it('should show the Sessions, Account and Logout links', () => {
      expect(
        debugElement.query(By.css('[data-testid="sessions-button"]')),
      ).toBeTruthy();
      expect(
        debugElement.query(By.css('[data-testid="account-button"]')),
      ).toBeTruthy();
      expect(
        debugElement.query(By.css('[data-testid="logout-button"]')),
      ).toBeTruthy();
    });

    it('should hide the Login and Register links', () => {
      expect(
        debugElement.query(By.css('[data-testid="login-button"]')),
      ).toBeFalsy();
      expect(
        debugElement.query(By.css('[data-testid="register-button"]')),
      ).toBeFalsy();
    });

    it('should log out the user and redirect to home when clicking Logout', () => {
      const logoutLink = debugElement.query(
        By.css('[data-testid="logout-button"]'),
      );

      logoutLink.nativeElement.click();

      expect(mockSessionService.logOut).toHaveBeenCalledTimes(1);
      expect(router.navigate).toHaveBeenCalledWith(['']);
    });
  });

  describe('when the user is logged out', () => {
    beforeEach(() => {
      mockSessionService.$isLogged.mockReturnValue(of(false));
      fixture.detectChanges();
    });

    it('should show the Login and Register links', () => {
      expect(
        debugElement.query(By.css('[data-testid="login-button"]')),
      ).toBeTruthy();
      expect(
        debugElement.query(By.css('[data-testid="register-button"]')),
      ).toBeTruthy();
    });

    it('should hide the Sessions, Account and Logout links', () => {
      expect(
        debugElement.query(By.css('[data-testid="sessions-button"]')),
      ).toBeFalsy();
      expect(
        debugElement.query(By.css('[data-testid="account-button"]')),
      ).toBeFalsy();
      expect(
        debugElement.query(By.css('[data-testid="logout-button"]')),
      ).toBeFalsy();
    });
  });
});
