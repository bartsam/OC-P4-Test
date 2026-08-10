import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { expect, jest } from '@jest/globals';
import { SessionService } from '../../../../core/service/session.service';

import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import {
  ActivatedRoute,
  convertToParamMap,
  provideRouter,
  Router,
} from '@angular/router';
import { of } from 'rxjs';
import { Session } from '../../../../core/models/session.interface';
import { Teacher } from '../../../../core/models/teacher.interface';
import { SessionApiService } from '../../../../core/service/session-api.service';
import { TeacherService } from '../../../../core/service/teacher.service';
import { DetailComponent } from './detail.component';

describe('DetailComponent', () => {
  let component: DetailComponent;
  let fixture: ComponentFixture<DetailComponent>;
  let debugElement: DebugElement;
  let router: Router;

  const mockSessionService = {
    sessionInformation: {
      admin: true,
      id: 1,
    },
  };

  const mockSessionApiService: jest.Mocked<
    Pick<
      SessionApiService,
      'detail' | 'delete' | 'participate' | 'unParticipate'
    >
  > = {
    delete: jest.fn<SessionApiService['delete']>(),
    detail: jest.fn<SessionApiService['detail']>(),
    participate: jest.fn<SessionApiService['participate']>(),
    unParticipate: jest.fn<SessionApiService['unParticipate']>(),
  };

  const mockTeacherService: jest.Mocked<Pick<TeacherService, 'detail'>> = {
    detail: jest.fn<TeacherService['detail']>(),
  };

  const mockMatSnackBar: jest.Mocked<Pick<MatSnackBar, 'open'>> = {
    open: jest.fn<MatSnackBar['open']>(),
  };

  const mockUserId = 1;

  const mockSessionId = 1;

  const mockTeacher: Teacher = {
    id: mockUserId,
    firstName: 'John',
    lastName: 'Doe',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockSession: Session = {
    id: mockSessionId,
    name: 'New session',
    description: 'A great session',
    date: new Date(),
    teacher_id: 1,
    users: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailComponent],
      providers: [
        provideRouter([]),
        { provide: SessionService, useValue: mockSessionService },
        { provide: SessionApiService, useValue: mockSessionApiService },
        { provide: TeacherService, useValue: mockTeacherService },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({ id: '1' }),
            },
          },
        },
      ],
    })
      .overrideProvider(MatSnackBar, { useValue: mockMatSnackBar })
      .compileComponents();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  function createComponentWithSession(
    isAdmin: boolean,
    session: Session,
  ): void {
    mockSessionService.sessionInformation = { admin: isAdmin, id: 1 };
    mockSessionApiService.detail.mockReturnValue(of(session));
    mockTeacherService.detail.mockReturnValue(of(mockTeacher));

    fixture = TestBed.createComponent(DetailComponent);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement;
    router = TestBed.inject(Router);

    jest.spyOn(router, 'navigate').mockResolvedValue(true);
    fixture.detectChanges();
  }

  it('should create', () => {
    createComponentWithSession(false, mockSession);
    expect(component).toBeTruthy();
  });

  describe('when the user is admin', () => {
    beforeEach(() => createComponentWithSession(true, mockSession));

    it('should show the Delete button and hide the participate buttons', () => {
      expect(
        debugElement.query(By.css('[data-testid="delete-button"]')),
      ).toBeTruthy();
      expect(
        debugElement.query(By.css('[data-testid="participate-button"]')),
      ).toBeFalsy();
      expect(
        debugElement.query(By.css('[data-testid="unparticipate-button"]')),
      ).toBeFalsy();
    });

    it('should delete the session, notify and navigate to sessions on click on Delete', () => {
      mockSessionApiService.delete.mockReturnValue(of(undefined));
      const deleteButton = debugElement.query(
        By.css('[data-testid="delete-button"]'),
      );

      deleteButton.nativeElement.click();

      expect(mockSessionApiService.delete).toHaveBeenCalledWith(
        String(mockSessionId),
      );
      expect(mockMatSnackBar.open).toHaveBeenCalledWith(
        'Session deleted !',
        'Close',
        {
          duration: 3000,
        },
      );
      expect(router.navigate).toHaveBeenCalledWith(['sessions']);
    });
  });

  describe('when the user is not participating', () => {
    beforeEach(() => {
      const sessionWithUsers = { ...mockSession, users: [2, 3] };
      createComponentWithSession(false, sessionWithUsers);
    });

    it('should show the Participate button only', () => {
      expect(
        debugElement.query(By.css('[data-testid="participate-button"]')),
      ).toBeTruthy();
      expect(
        debugElement.query(By.css('[data-testid="unparticipate-button"]')),
      ).toBeFalsy();
      expect(
        debugElement.query(By.css('[data-testid="delete-button"]')),
      ).toBeFalsy();
    });

    it('should call participate() and refresh the session when clicking on Participate', () => {
      const sessionWithCurrentUser = { ...mockSession, users: [1, 2, 3] };
      mockSessionApiService.participate.mockReturnValue(of(undefined));
      mockSessionApiService.detail.mockReturnValue(of(sessionWithCurrentUser));

      const participateButton = debugElement.query(
        By.css('[data-testid="participate-button"]'),
      );
      participateButton.nativeElement.click();
      fixture.detectChanges();

      expect(mockSessionApiService.participate).toHaveBeenCalledWith(
        String(mockSessionId),
        String(mockUserId),
      );
      expect(component.session).toEqual(sessionWithCurrentUser);
      expect(component.isParticipate).toBe(true);
    });
  });

  describe('when the user is participating', () => {
    beforeEach(() => {
      const sessionWithUsers = { ...mockSession, users: [1, 2, 3] };
      createComponentWithSession(false, sessionWithUsers);
    });

    it('should show the "Do not participate" button only', () => {
      expect(
        debugElement.query(By.css('[data-testid="unparticipate-button"]')),
      ).toBeTruthy();
      expect(
        debugElement.query(By.css('[data-testid="participate-button"]')),
      ).toBeFalsy();
    });

    it('should call unParticipate() and refresh the session when clicking "Do not participate"', () => {
      const sessionWithoutCurrentUser = { ...mockSession, users: [2, 3] };
      mockSessionApiService.unParticipate.mockReturnValue(of(undefined));
      mockSessionApiService.detail.mockReturnValue(
        of(sessionWithoutCurrentUser),
      );

      const button = debugElement.query(
        By.css('[data-testid="unparticipate-button"]'),
      );
      button.nativeElement.click();
      fixture.detectChanges();

      expect(mockSessionApiService.unParticipate).toHaveBeenCalledWith(
        String(mockSessionId),
        String(mockUserId),
      );
      expect(component.session).toEqual(sessionWithoutCurrentUser);
      expect(component.isParticipate).toBe(false);
    });
  });
});
