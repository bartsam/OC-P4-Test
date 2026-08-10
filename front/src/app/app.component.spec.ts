import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatToolbarModule } from '@angular/material/toolbar';
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
      imports: [AppComponent, MatToolbarModule],
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
    jest.resetAllMocks();
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
      expect(
        debugElement.query(By.css('[data-testid="login-link"]')),
      ).toBeFalsy();
      expect(
        debugElement.query(By.css('[data-testid="register-link"]')),
      ).toBeFalsy();
    });

    it('should log out the user and redirect to home when clicking Logout', () => {
      const logoutLink = debugElement.query(
        By.css('[data-testid="logout-link"]'),
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
