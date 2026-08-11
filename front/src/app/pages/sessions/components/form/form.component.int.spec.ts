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
import { FormComponent } from './form.component';

describe('FormComponent Integration tests', () => {
  let component: FormComponent;
  let fixture: ComponentFixture<FormComponent>;
  let debugElement: DebugElement;
  let httpTestingController: HttpTestingController;
  let sessionService: SessionService;
  let router: Router;

  const sessionId = '1';
  const sessionApiUrl = 'api/session';
  const teacherApiUrl = 'api/teacher';

  const mockMatSnackBar: jest.Mocked<Pick<MatSnackBar, 'open'>> = {
    open: jest.fn(),
  };

  const mockTeachers: Teacher[] = [
    {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const mockSession: Session = {
    id: 1,
    name: 'New session',
    description: 'A great session',
    date: new Date('2026-01-01'),
    teacher_id: 1,
    users: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormComponent],
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
              paramMap: convertToParamMap({ id: sessionId }),
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

  function createComponentWithSession(
    isAdmin = true,
    isUpdateMode = false,
  ): void {
    const sessionInfo: SessionInformation = {
      token: 'fake-token',
      type: 'Bearer',
      id: 1,
      username: 'admin@test.com',
      firstName: 'Admin',
      lastName: 'User',
      admin: isAdmin,
    };

    sessionService.logIn(sessionInfo);

    const currentUrl = isUpdateMode
      ? `/sessions/update/${sessionId}`
      : '/sessions/create';

    jest.spyOn(router, 'url', 'get').mockReturnValue(currentUrl);

    fixture = TestBed.createComponent(FormComponent);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement;

    fixture.detectChanges();

    if (!isAdmin) {
      return;
    }

    if (isUpdateMode) {
      const sessionReq = httpTestingController.expectOne(
        `${sessionApiUrl}/${sessionId}`,
      );
      expect(sessionReq.request.method).toBe('GET');
      sessionReq.flush(mockSession);

      fixture.detectChanges();
    }

    const teacherReq = httpTestingController.expectOne(teacherApiUrl);
    expect(teacherReq.request.method).toBe('GET');
    teacherReq.flush(mockTeachers);

    fixture.detectChanges();
  }

  it('should redirect non-admin user to "/sessions"', () => {
    createComponentWithSession(false);
    expect(router.navigate).toHaveBeenCalledWith(['/sessions']);
  });

  it('should load list of teachers on init in create mode', () => {
    createComponentWithSession(true, false);

    expect(component.onUpdate).toBe(false);
    expect(component.sessionForm?.valid).toBe(false);
  });

  it('should POST request, display snackbar and navigate when creating a session', () => {
    createComponentWithSession(true, false);

    const newSessionData = {
      name: 'New session',
      description: 'A great session',
      date: '2026-01-01',
      teacher_id: 1,
    };

    component.sessionForm?.setValue(newSessionData);
    fixture.detectChanges();

    const submitButton = debugElement.query(By.css('button[type="submit"]'));
    submitButton.nativeElement.click();

    const createReq = httpTestingController.expectOne(sessionApiUrl);
    expect(createReq.request.method).toBe('POST');
    expect(createReq.request.body).toEqual(newSessionData);
    createReq.flush(mockSession);

    expect(mockMatSnackBar.open).toHaveBeenCalledWith(
      'Session created !',
      'Close',
      { duration: 3000 },
    );
    expect(router.navigate).toHaveBeenCalledWith(['sessions']);
  });

  it('should fetch session details and send PUT request when updating a session', () => {
    createComponentWithSession(true, true);

    expect(component.onUpdate).toBe(true);
    expect(component.sessionForm?.get('name')?.value).toBe('New session');

    const updatedSessionData = {
      name: 'New session',
      description: 'A great session',
      date: '2026-01-01',
      teacher_id: 1,
    };

    component.sessionForm?.setValue(updatedSessionData);
    fixture.detectChanges();

    const submitButton = debugElement.query(By.css('button[type="submit"]'));
    submitButton.nativeElement.click();

    const updateReq = httpTestingController.expectOne(
      `${sessionApiUrl}/${sessionId}`,
    );
    expect(updateReq.request.method).toBe('PUT');
    expect(updateReq.request.body).toEqual(updatedSessionData);
    updateReq.flush(mockSession);

    expect(mockMatSnackBar.open).toHaveBeenCalledWith(
      'Session updated !',
      'Close',
      { duration: 3000 },
    );

    expect(router.navigate).toHaveBeenCalledWith(['sessions']);
  });
});
