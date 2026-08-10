import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { expect, jest } from '@jest/globals';

import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { SessionInformation } from '../../core/models/sessionInformation.interface';
import { User } from '../../core/models/user.interface';
import { SessionService } from '../../core/service/session.service';
import { UserService } from '../../core/service/user.service';
import { MeComponent } from './me.component';

describe('MeComponent', () => {
  let component: MeComponent;
  let fixture: ComponentFixture<MeComponent>;
  let debugElement: DebugElement;
  let router: Router;

  type MockSessionService = Pick<SessionService, 'logOut'> & {
    sessionInformation: Partial<SessionInformation>;
  };

  const mockSessionService: MockSessionService = {
    sessionInformation: {
      admin: false,
      id: 1,
    },
    logOut: jest.fn(),
  };

  const mockUserService: jest.Mocked<Pick<UserService, 'delete' | 'getById'>> =
    {
      getById: jest.fn(),
      delete: jest.fn(),
    };

  const mockMatSnackBar: jest.Mocked<Pick<MatSnackBar, 'open'>> = {
    open: jest.fn(),
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

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MeComponent],
      providers: [
        provideRouter([]),
        { provide: SessionService, useValue: mockSessionService },
        { provide: UserService, useValue: mockUserService },
      ],
    })
      // Force le remplacement de MatSnackBar importé par MeComponent
      .overrideProvider(MatSnackBar, { useValue: mockMatSnackBar })
      .compileComponents();

    fixture = TestBed.createComponent(MeComponent);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement;
    router = TestBed.inject(Router);

    jest.spyOn(router, 'navigate').mockResolvedValue(true);
    jest.spyOn(window.history, 'back').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should fetch the user with the id from the session', () => {
      mockUserService.getById.mockReturnValue(of(mockUser));

      fixture.detectChanges();

      expect(mockUserService.getById).toHaveBeenCalledWith('1');
      expect(component.user).toEqual(mockUser);
    });
  });

  describe('when the user is logged', () => {
    beforeEach(() => {
      mockUserService.getById.mockReturnValue(of(mockUser));
      fixture.detectChanges();
    });

    it('should display the user name and email', () => {
      const name = debugElement.query(By.css('[data-testid="user-name"]'));
      const email = debugElement.query(By.css('[data-testid="user-email"]'));

      expect(name.nativeElement.textContent).toContain('John');
      expect(email.nativeElement.textContent).toContain('john.doe@test.com');
    });

    it('should show the Delete button and hide the admin message', () => {
      expect(
        debugElement.query(By.css('[data-testid="delete-button"]')),
      ).toBeTruthy();
      expect(
        debugElement.query(By.css('[data-testid="admin-message"]')),
      ).toBeFalsy();
    });

    it('should delete the account, notify, log out and redirect when clicking Delete', () => {
      mockUserService.delete.mockReturnValue(of(undefined));
      const deleteButton = debugElement.query(
        By.css('[data-testid="delete-button"]'),
      );

      deleteButton.nativeElement.click();

      expect(mockUserService.delete).toHaveBeenCalledWith('1');
      expect(mockMatSnackBar.open).toHaveBeenCalledWith(
        'Your account has been deleted !',
        'Close',
        { duration: 3000 },
      );
      expect(mockSessionService.logOut).toHaveBeenCalledTimes(1);
      expect(router.navigate).toHaveBeenCalledWith(['/']);
    });
  });

  describe('when the user is an admin', () => {
    beforeEach(() => {
      mockUserService.getById.mockReturnValue(of(mockAdminUser));
      fixture.detectChanges();
    });

    it('should show the admin message and hide the Delete button', () => {
      expect(
        debugElement.query(By.css('[data-testid="admin-message"]')),
      ).toBeTruthy();
      expect(
        debugElement.query(By.css('[data-testid="delete-button"]')),
      ).toBeFalsy();
    });
  });

  describe('back()', () => {
    it('should call window.history.back when clicking the back button', () => {
      mockUserService.getById.mockReturnValue(of(mockUser));
      fixture.detectChanges();

      const backButton = debugElement.query(
        By.css('[data-testid="back-button"]'),
      );
      backButton.nativeElement.click();

      expect(window.history.back).toHaveBeenCalledTimes(1);
    });
  });
});
