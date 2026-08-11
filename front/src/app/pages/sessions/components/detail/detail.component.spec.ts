import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import {
  ActivatedRoute,
  convertToParamMap,
  provideRouter,
} from '@angular/router';
import { expect, jest } from '@jest/globals';
import { of } from 'rxjs';
import { Session } from '../../../../core/models/session.interface';
import { Teacher } from '../../../../core/models/teacher.interface';
import { SessionApiService } from '../../../../core/service/session-api.service';
import { SessionService } from '../../../../core/service/session.service';
import { TeacherService } from '../../../../core/service/teacher.service';
import { DetailComponent } from './detail.component';

describe('DetailComponent Unit tests', () => {
  let component: DetailComponent;
  let fixture: ComponentFixture<DetailComponent>;
  let debugElement: DebugElement;

  const mockSessionService = {
    sessionInformation: {
      admin: false,
      id: 1,
    },
  };

  const mockSessionApiService: jest.Mocked<Pick<SessionApiService, 'detail'>> =
    {
      detail: jest.fn<SessionApiService['detail']>(),
    };

  const mockTeacherService: jest.Mocked<Pick<TeacherService, 'detail'>> = {
    detail: jest.fn<TeacherService['detail']>(),
  };

  const mockTeacher: Teacher = {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockSession: Session = {
    id: 1,
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
    }).compileComponents();
  });

  afterEach(() => {
    jest.clearAllMocks();
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
    fixture.detectChanges();
  }

  it('should create the component', () => {
    createComponentWithSession(false, mockSession);
    expect(component).toBeTruthy();
  });

  it('should display Delete button and hide participation buttons when user is admin', () => {
    createComponentWithSession(true, mockSession);

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

  it('should display Participate button only when user is not participating', () => {
    const sessionWithoutUser = { ...mockSession, users: [2, 3] };
    createComponentWithSession(false, sessionWithoutUser);

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

  it('should display "Do not participate" button only when user is participating', () => {
    const sessionWithUser = { ...mockSession, users: [1, 2, 3] };
    createComponentWithSession(false, sessionWithUser);

    expect(
      debugElement.query(By.css('[data-testid="unparticipate-button"]')),
    ).toBeTruthy();
    expect(
      debugElement.query(By.css('[data-testid="participate-button"]')),
    ).toBeFalsy();
    expect(
      debugElement.query(By.css('[data-testid="delete-button"]')),
    ).toBeFalsy();
  });
});
