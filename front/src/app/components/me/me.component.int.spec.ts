import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { expect, jest } from '@jest/globals';

import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { provideRouter, Router } from '@angular/router';
import { SessionInformation } from '../../core/models/sessionInformation.interface';
import { User } from '../../core/models/user.interface';
import { SessionService } from '../../core/service/session.service';
import { UserService } from '../../core/service/user.service';
import { MeComponent } from './me.component';

describe('MeComponent Integration tests', () => {
  let component: MeComponent;
  let fixture: ComponentFixture<MeComponent>;
  let debugElement: DebugElement;
  let httpTestingController: HttpTestingController;
  let sessionService: SessionService;
  let router: Router;

  const mockSessionInformation: SessionInformation = {
    token: 'fake-token',
    type: 'Bearer',
    id: 1,
    username: 'john.doe@test.com',
    firstName: 'John',
    lastName: 'Doe',
    admin: false,
  };

  const mockUser: User = {
    id: 1,
    email: 'john.doe@test.com',
    lastName: 'Doe',
    firstName: 'John',
    admin: false,
    password: 'azerty',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockAdminUser: User = {
    ...mockUser,
    admin: true,
  };

  const userApiUrl = `api/user/${mockSessionInformation.id}`;

  const mockMatSnackBar: jest.Mocked<Pick<MatSnackBar, 'open'>> = {
    open: jest.fn(),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MeComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        SessionService,
        UserService,
      ],
    })
      .overrideProvider(MatSnackBar, { useValue: mockMatSnackBar })
      .compileComponents();

    httpTestingController = TestBed.inject(HttpTestingController);
    sessionService = TestBed.inject(SessionService);
    router = TestBed.inject(Router);

    sessionService.logIn(mockSessionInformation);
    jest.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture = TestBed.createComponent(MeComponent);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement;
  });

  afterEach(() => {
    httpTestingController.verify();
    jest.clearAllMocks();
  });

  it('should create and fetch the user via GET request on init', () => {
    fixture.detectChanges();
    const req = httpTestingController.expectOne(userApiUrl);
    expect(req.request.method).toBe('GET');
    req.flush(mockUser);

    expect(component).toBeTruthy();
  });

  describe('when the user is admin', () => {
    beforeEach(() => {
      fixture.detectChanges();
      httpTestingController.expectOne(userApiUrl).flush(mockAdminUser);
      fixture.detectChanges();
    });

    it('should fetch the admin user', () => {
      expect(component.user).toEqual(mockAdminUser);
    });

    it('should show the admin message', () => {
      const adminMessage = debugElement.query(
        By.css('[data-testid="admin-message"]'),
      );
      expect(adminMessage).toBeTruthy();
      expect(adminMessage.nativeElement.textContent.trim()).toBe(
        'You are admin',
      );
    });
  });

  describe('when the user is not admin', () => {
    beforeEach(() => {
      fixture.detectChanges();
      httpTestingController.expectOne(userApiUrl).flush(mockUser);
      fixture.detectChanges();
    });

    it('should fetch the user', () => {
      expect(component.user).toEqual(mockUser);
    });

    it('should delete the account, notify, log out and redirect when clicking Delete', () => {
      const deleteButton = debugElement.query(
        By.css('[data-testid="delete-button"]'),
      );
      deleteButton.nativeElement.click();

      const deleteReq = httpTestingController.expectOne(userApiUrl);
      expect(deleteReq.request.method).toBe('DELETE');
      deleteReq.flush(null);

      expect(sessionService.isLogged).toBe(false);
      expect(sessionService.sessionInformation).toBeUndefined();
      expect(mockMatSnackBar.open).toHaveBeenCalledWith(
        'Your account has been deleted !',
        'Close',
        { duration: 3000 },
      );
      expect(router.navigate).toHaveBeenCalledWith(['/']);
    });
  });
});
