import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { expect } from '@jest/globals';

import { Observable } from 'rxjs';
import { Session } from '../models/session.interface';
import { SessionApiService } from './session-api.service';

describe('SessionsAPIService', () => {
  let service: SessionApiService;
  let httpMock: HttpTestingController;

  const mockUserId = '1';
  const mockSessionId = '1';
  const mockSession: Session = {
    id: 1,
    name: 'Yoga',
    description: '',
    date: new Date(),
    teacher_id: 1,
    users: [],
  };
  const mockSessions: Session[] = [mockSession];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(SessionApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  function expectHttpRequest(
    observable: Observable<Session[] | Session | void>,
    url: string,
    method: string,
    mockResponse: Session[] | Session | null,
  ): void {
    let result: unknown;

    observable.subscribe((response) => {
      result = response;
    });

    const req = httpMock.expectOne(url);
    expect(req.request.method).toBe(method);
    req.flush(mockResponse);

    expect(result).toEqual(mockResponse);
  }

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get ALL sessions', () => {
    expectHttpRequest(service.all(), 'api/session', 'GET', mockSessions);
  });

  it('should get session DETAIL', () => {
    expectHttpRequest(
      service.detail(mockSessionId),
      `api/session/${mockSessionId}`,
      'GET',
      mockSession,
    );
  });

  it('should DELETE session', () => {
    expectHttpRequest(
      service.delete(mockSessionId),
      `api/session/${mockSessionId}`,
      'DELETE',
      null,
    );
  });

  it('should CREATE session', () => {
    expectHttpRequest(
      service.create(mockSession),
      'api/session',
      'POST',
      mockSession,
    );
  });

  it('should UPDATE session', () => {
    expectHttpRequest(
      service.update(mockSessionId, mockSession),
      `api/session/${mockSessionId}`,
      'PUT',
      mockSession,
    );
  });

  it('should PARTICIPATE to a session', () => {
    expectHttpRequest(
      service.participate(mockSessionId, mockUserId),
      `api/session/${mockSessionId}/participate/${mockUserId}`,
      'POST',
      null,
    );
  });

  it('should UNPARTICIPATE to a session', () => {
    expectHttpRequest(
      service.unParticipate(mockSessionId, mockUserId),
      `api/session/${mockSessionId}/participate/${mockUserId}`,
      'DELETE',
      null,
    );
  });
});
