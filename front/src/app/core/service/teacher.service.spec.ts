import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { expect } from '@jest/globals';

import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { Teacher } from '../models/teacher.interface';
import { TeacherService } from './teacher.service';

describe('TeacherService', () => {
  let service: TeacherService;
  let httpMock: HttpTestingController;

  const pathService = 'api/teacher';
  const mockTeacher: Teacher = {
    id: 1,
    lastName: 'John',
    firstName: 'Doe',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const mockTeachers: Teacher[] = [mockTeacher];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(TeacherService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get ALL teachers', async () => {
    const resPromise = firstValueFrom(service.all());
    const request = httpMock.expectOne(pathService);

    expect(request.request.method).toBe('GET');
    request.flush(mockTeachers);

    const result = await resPromise;
    expect(result).toEqual(mockTeachers);
  });

  it('should get teacher DETAIL', async () => {
    const teacherId = '1';
    const resPromise = firstValueFrom(service.detail(teacherId));
    const req = httpMock.expectOne(`${pathService}/${teacherId}`);

    expect(req.request.method).toBe('GET');
    req.flush(mockTeacher);

    const result = await resPromise;
    expect(result).toEqual(mockTeacher);
  });
});
