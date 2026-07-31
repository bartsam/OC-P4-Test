import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { expect } from '@jest/globals';

import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { User } from '../models/user.interface';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;

  const pathService = 'api/user';
  const mockUserId = '1';
  const mockUser: User = {
    id: 1,
    email: 'john.doe@test.com',
    lastName: 'John',
    firstName: 'Doe',
    admin: false,
    password: 'azerty',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get an user with an id', async () => {
    const resPromise = firstValueFrom(service.getById(mockUserId));
    const req = httpMock.expectOne(`${pathService}/${mockUserId}`);

    expect(req.request.method).toBe('GET');
    req.flush(mockUser);

    const result = await resPromise;
    expect(result).toEqual(mockUser);
  });

  it('should delete an user with an id', async () => {
    const resPromise = firstValueFrom(service.delete(mockUserId));
    const req = httpMock.expectOne(`${pathService}/${mockUserId}`);

    expect(req.request.method).toBe('DELETE');
    req.flush(null);

    const result = await resPromise;
    expect(result).toBeNull();
  });
});
