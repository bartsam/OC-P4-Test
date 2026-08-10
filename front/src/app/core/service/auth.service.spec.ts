import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { expect } from '@jest/globals';

import { LoginRequest } from '../models/loginRequest.interface';
import { RegisterRequest } from '../models/registerRequest.interface';
import { SessionInformation } from '../models/sessionInformation.interface';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should send a register request to the server', () => {
    const registerRequest: RegisterRequest = {
      email: 'john.doe@test.com',
      firstName: 'John',
      lastName: 'Doe',
      password: 'azerty',
    };

    service.register(registerRequest).subscribe();

    const req = httpMock.expectOne('/api/auth/register');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(registerRequest);

    req.flush(null);
  });

  it('should return the session information on successful login', () => {
    const loginRequest: LoginRequest = {
      email: 'john.doe@test.com',
      password: 'azerty',
    };
    const mockSessionInformation: SessionInformation = {
      token: 'token',
      type: 'Bearer',
      id: 1,
      username: 'johndoe',
      firstName: 'John',
      lastName: 'Doe',
      admin: false,
    };

    let result: SessionInformation | undefined;
    service.login(loginRequest).subscribe((response) => {
      result = response;
    });

    const req = httpMock.expectOne('/api/auth/login');
    req.flush(mockSessionInformation);

    expect(result).toEqual(mockSessionInformation);
  });
});
