import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { By } from '@angular/platform-browser';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import {
  ActivatedRoute,
  convertToParamMap,
  provideRouter,
  Router,
} from '@angular/router';
import { expect, jest } from '@jest/globals';
import { Session } from '../../../../core/models/session.interface';
import { SessionInformation } from '../../../../core/models/sessionInformation.interface';
import { Teacher } from '../../../../core/models/teacher.interface';
import { SessionApiService } from '../../../../core/service/session-api.service';
import { SessionService } from '../../../../core/service/session.service';
import { TeacherService } from '../../../../core/service/teacher.service';
import { DetailComponent } from './detail.component';

describe('DetailComponent Integration tests', () => {
  let component: DetailComponent;
  let fixture: ComponentFixture<DetailComponent>;
  let debugElement: DebugElement;
  let httpTestingController: HttpTestingController;
  let sessionService: SessionService;
  let router: Router;

  const sessionId = '1';
  const teacherId = '1';
  const userId = '1';
  const sessionApiUrl = `api/session/${sessionId}`;
  const teacherApiUrl = `api/teacher/${teacherId}`;

  const mockMatSnackBar: jest.Mocked<Pick<MatSnackBar, 'open'>> = {
    open: jest.fn(),
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
    name: 'Yoga Class',
    description: 'Relaxation session',
    date: new Date(),
    teacher_id: 1,
    users: [2, 3],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        provideNoopAnimations(),
        SessionService,
        SessionApiService,
        TeacherService,
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

    httpTestingController = TestBed.inject(HttpTestingController);
    sessionService = TestBed.inject(SessionService);
    router = TestBed.inject(Router);

    jest.spyOn(router, 'navigate').mockResolvedValue(true);
  });

  afterEach(() => {
    httpTestingController.verify();
    jest.clearAllMocks();
  });

  function createComponentWithSession(isAdmin = false): void {
    const sessionInfo: SessionInformation = {
      token: 'fake-token',
      type: 'Bearer',
      id: 1,
      username: 'john.doe@test.com',
      firstName: 'John',
      lastName: 'Doe',
      admin: isAdmin,
    };

    sessionService.logIn(sessionInfo);

    fixture = TestBed.createComponent(DetailComponent);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement;
    fixture.detectChanges();

    const sessionReq = httpTestingController.expectOne(sessionApiUrl);
    expect(sessionReq.request.method).toBe('GET');
    sessionReq.flush(mockSession);

    const teacherReq = httpTestingController.expectOne(teacherApiUrl);
    expect(teacherReq.request.method).toBe('GET');
    teacherReq.flush(mockTeacher);

    fixture.detectChanges();
  }

  it('should fetch session and teacher details on init', () => {
    createComponentWithSession();

    expect(component.session).toEqual(mockSession);
    expect(component.teacher).toEqual(mockTeacher);
    expect(component.isParticipate).toBe(false);
  });

  it('should DELETE session, notify via snackbar and navigate when admin clicks delete', () => {
    createComponentWithSession(true);

    const deleteButton = debugElement.query(
      By.css('[data-testid="delete-button"]'),
    );
    deleteButton.nativeElement.click();

    const deleteReq = httpTestingController.expectOne(sessionApiUrl);
    expect(deleteReq.request.method).toBe('DELETE');
    deleteReq.flush(null);

    expect(mockMatSnackBar.open).toHaveBeenCalledWith(
      'Session deleted !',
      'Close',
      { duration: 3000 },
    );
    expect(router.navigate).toHaveBeenCalledWith(['sessions']);
  });

  it('should POST participate and refresh session when user participates', () => {
    createComponentWithSession(false);

    const participateButton = debugElement.query(
      By.css('[data-testid="participate-button"]'),
    );
    participateButton.nativeElement.click();

    const participateReq = httpTestingController.expectOne(
      `${sessionApiUrl}/participate/${userId}`,
    );
    expect(participateReq.request.method).toBe('POST');
    participateReq.flush(null);

    const updatedSession = { ...mockSession, users: [1, 2, 3] };
    const refreshSessionReq = httpTestingController.expectOne(sessionApiUrl);
    refreshSessionReq.flush(updatedSession);

    const refreshTeacherReq = httpTestingController.expectOne(teacherApiUrl);
    refreshTeacherReq.flush(mockTeacher);

    fixture.detectChanges();

    expect(component.isParticipate).toBe(true);
    expect(component.session?.users).toContain(1);
  });

  it('should DELETE participate and refresh session when user unparticipates', () => {
    mockSession.users = [1, 2, 3];
    createComponentWithSession(false);

    const unparticipateButton = debugElement.query(
      By.css('[data-testid="unparticipate-button"]'),
    );
    unparticipateButton.nativeElement.click();

    const unparticipateReq = httpTestingController.expectOne(
      `${sessionApiUrl}/participate/${userId}`,
    );
    expect(unparticipateReq.request.method).toBe('DELETE');
    unparticipateReq.flush(null);

    const updatedSession = { ...mockSession, users: [2, 3] };
    const refreshSessionReq = httpTestingController.expectOne(sessionApiUrl);
    refreshSessionReq.flush(updatedSession);

    const refreshTeacherReq = httpTestingController.expectOne(teacherApiUrl);
    refreshTeacherReq.flush(mockTeacher);

    fixture.detectChanges();

    expect(component.isParticipate).toBe(false);
    expect(component.session?.users).not.toContain(1);
  });
});
