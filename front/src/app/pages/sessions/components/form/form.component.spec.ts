import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import {
  ActivatedRoute,
  convertToParamMap,
  provideRouter,
  Router,
} from '@angular/router';
import { expect, jest } from '@jest/globals';
import { of } from 'rxjs';
import { Session } from '../../../../core/models/session.interface';
import { Teacher } from '../../../../core/models/teacher.interface';
import { SessionApiService } from '../../../../core/service/session-api.service';
import { SessionService } from '../../../../core/service/session.service';
import { TeacherService } from '../../../../core/service/teacher.service';
import { FormComponent } from './form.component';

describe('FormComponent Unit tests', () => {
  let component: FormComponent;
  let fixture: ComponentFixture<FormComponent>;
  let debugElement: DebugElement;
  let router: Router;

  const mockSessionId = '1';

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

  const mockTeachers: Teacher[] = [
    {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const mockSessionService = {
    sessionInformation: {
      admin: true,
    },
  };

  const mockSessionApiService: jest.Mocked<Pick<SessionApiService, 'detail'>> =
    {
      detail: jest.fn<SessionApiService['detail']>(),
    };

  const mockTeacherService: jest.Mocked<Pick<TeacherService, 'all'>> = {
    all: jest.fn<TeacherService['all']>(),
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
              paramMap: convertToParamMap({ id: mockSessionId }),
            },
          },
        },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    jest.spyOn(router, 'navigate').mockResolvedValue(true);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  function createComponentWithSession(isAdmin: boolean): void {
    mockSessionService.sessionInformation = { admin: isAdmin };
    mockTeacherService.all.mockReturnValue(of(mockTeachers));
    mockSessionApiService.detail.mockReturnValue(of(mockSession));

    fixture = TestBed.createComponent(FormComponent);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement;

    fixture.detectChanges();
  }

  it('should create the component', () => {
    createComponentWithSession(true);
    expect(component).toBeTruthy();
  });

  it('should redirect to "/sessions" if user is not admin', () => {
    createComponentWithSession(false);
    expect(router.navigate).toHaveBeenCalledWith(['/sessions']);
  });

  describe('Form Validation', () => {
    beforeEach(() => createComponentWithSession(true));

    it('should keep submit button disabled when form is invalid', () => {
      const submitButton = debugElement.query(By.css('button[type="submit"]'));
      expect(submitButton.nativeElement.disabled).toBe(true);
    });

    it('should enable submit button when form is filled', () => {
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
});
