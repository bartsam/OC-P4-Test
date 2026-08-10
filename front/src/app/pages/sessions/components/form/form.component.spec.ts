import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { expect, jest } from '@jest/globals';

import { DebugElement } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { By } from '@angular/platform-browser';
import {
  ActivatedRoute,
  convertToParamMap,
  provideRouter,
  Router,
} from '@angular/router';
import { of } from 'rxjs';
import { Session } from '../../../../core/models/session.interface';
import { SessionApiService } from '../../../../core/service/session-api.service';
import { SessionService } from '../../../../core/service/session.service';
import { TeacherService } from '../../../../core/service/teacher.service';
import { FormComponent } from './form.component';

describe('FormComponent', () => {
  let component: FormComponent;
  let fixture: ComponentFixture<FormComponent>;
  let debugElement: DebugElement;
  let router: Router;

  const mockSessionId = 1;

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

  const mockSessionService = {
    sessionInformation: {
      admin: true,
    },
  };

  const mockSessionApiService: jest.Mocked<
    Pick<SessionApiService, 'detail' | 'create' | 'update'>
  > = {
    detail: jest.fn<SessionApiService['detail']>(),
    create: jest.fn<SessionApiService['create']>(),
    update: jest.fn<SessionApiService['update']>(),
  };

  const mockTeacherService: jest.Mocked<Pick<TeacherService, 'all'>> = {
    all: jest.fn<TeacherService['all']>(),
  };

  const mockMatSnackBar: jest.Mocked<Pick<MatSnackBar, 'open'>> = {
    open: jest.fn<MatSnackBar['open']>(),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormComponent],
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
        { provide: SessionService, useValue: mockSessionService },
        { provide: SessionApiService, useValue: mockSessionApiService },
        { provide: TeacherService, useValue: mockTeacherService },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({ id: String(mockSessionId) }),
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
    url = '/sessions/create',
  ): void {
    mockSessionService.sessionInformation = { admin: isAdmin };
    mockSessionApiService.detail.mockReturnValue(of(session));
    mockTeacherService.all.mockReturnValue(of([]));

    router = TestBed.inject(Router);
    jest.spyOn(router, 'url', 'get').mockReturnValue(url);
    jest.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture = TestBed.createComponent(FormComponent);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement;

    fixture.detectChanges();
  }

  it('should create', () => {
    createComponentWithSession(false, mockSession);
    expect(component).toBeTruthy();
  });

  it('should redirect to "/sessions" if the user is not admin', () => {
    createComponentWithSession(false, mockSession);
    expect(router.navigate).toHaveBeenCalledWith(['/sessions']);
  });

  describe('when in create mode', () => {
    beforeEach(() => createComponentWithSession(true, mockSession));

    it('should not redirect to "/sessions"', () => {
      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('should not call sessionApiService.detail', () => {
      expect(mockSessionApiService.detail).not.toHaveBeenCalled();
    });

    it('should display an empty form', () => {
      expect(component.onUpdate).toBe(false);
      expect(component.sessionForm?.get('name')?.value).toBe('');
    });

    it('should submit the form and navigate to "/sessions" when succeeds', () => {
      mockSessionApiService.create.mockReturnValue(of(mockSession));

      const formValues: Partial<Session> = {
        name: 'New session',
        description: 'A great session',
        date: new Date(),
        teacher_id: 1,
      };
      component.sessionForm?.setValue(formValues);
      fixture.detectChanges();

      const submitButton = debugElement.query(By.css('button[type="submit"]'));
      submitButton.nativeElement.click();
      fixture.detectChanges();

      expect(mockSessionApiService.create).toHaveBeenCalledWith(formValues);
      expect(router.navigate).toHaveBeenCalledWith(['sessions']);
    });

    it('should disable the submit button when the form is empty', () => {
      const submitButton = debugElement.query(By.css('button[type="submit"]'));
      expect(submitButton.nativeElement.disabled).toBe(true);
    });

    it('should enable the submit button when the form is valid', () => {
      component.sessionForm?.setValue({
        name: 'New session',
        description: 'A great session',
        date: new Date(),
        teacher_id: 1,
      });
      fixture.detectChanges();

      const submitButton = debugElement.query(By.css('button[type="submit"]'));
      expect(submitButton.nativeElement.disabled).toBe(false);
    });
  });

  describe('when in update mode', () => {
    beforeEach(() =>
      createComponentWithSession(true, mockSession, '/sessions/update/1'),
    );

    it('should call sessionApiService.detail and pre-fill the form', () => {
      expect(mockSessionApiService.detail).toHaveBeenCalledWith(
        String(mockSessionId),
      );
      expect(component.onUpdate).toBe(true);
      expect(component.sessionForm?.get('name')?.value).toBe(mockSession.name);
      expect(component.sessionForm?.get('teacher_id')?.value).toBe(
        mockSession.teacher_id,
      );
      expect(component.sessionForm?.get('description')?.value).toBe(
        mockSession.description,
      );
    });

    it('should submit the form and navigate to "/sessions" when succeeds', () => {
      mockSessionApiService.update.mockReturnValue(of(mockSession));

      const formValues: Partial<Session> = {
        name: 'Old session',
        description: 'A good session',
        date: new Date(),
        teacher_id: 1,
      };
      component.sessionForm?.setValue(formValues);
      fixture.detectChanges();

      const submitButton = debugElement.query(By.css('button[type="submit"]'));
      submitButton.nativeElement.click();
      fixture.detectChanges();

      expect(mockSessionApiService.update).toHaveBeenCalledWith(
        String(mockSessionId),
        formValues,
      );
      expect(router.navigate).toHaveBeenCalledWith(['sessions']);
    });
  });
});
