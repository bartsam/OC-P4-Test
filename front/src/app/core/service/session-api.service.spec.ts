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
  const mockBody = mockSession;

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

  function expectHttpRequest({
    observable,
    url,
    method,
    mockResponse,
    body = null,
  }: {
    observable: Observable<Session[] | Session | void>;
    url: string;
    method: string;
    mockResponse: Session[] | Session | null;
    body?: Session | null;
  }): void {
    let result: unknown;

    observable.subscribe((response) => {
      result = response;
    });

    const req = httpMock.expectOne(url);
    expect(req.request.method).toBe(method);
    expect(req.request.body).toEqual(body);
    req.flush(mockResponse);

    expect(result).toEqual(mockResponse);
  }

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get ALL sessions', () => {
    expectHttpRequest({
      observable: service.all(),
      url: 'api/session',
      method: 'GET',
      body: null,
      mockResponse: mockSessions,
    });
  });

  it('should get session DETAIL', () => {
    expectHttpRequest({
      observable: service.detail(mockSessionId),
      url: `api/session/${mockSessionId}`,
      method: 'GET',
      body: null,
      mockResponse: mockSession,
    });
  });

  it('should DELETE session', () => {
    expectHttpRequest({
      observable: service.delete(mockSessionId),
      url: `api/session/${mockSessionId}`,
      method: 'DELETE',
      body: null,
      mockResponse: null,
    });
  });

  it('should CREATE session', () => {
    expectHttpRequest({
      observable: service.create(mockSession),
      url: 'api/session',
      method: 'POST',
      body: mockBody,
      mockResponse: mockSession,
    });
  });

  it('should UPDATE session', () => {
    expectHttpRequest({
      observable: service.update(mockSessionId, mockSession),
      url: `api/session/${mockSessionId}`,
      method: 'PUT',
      body: mockBody,
      mockResponse: mockSession,
    });
  });

  it('should PARTICIPATE to a session', () => {
    expectHttpRequest({
      observable: service.participate(mockSessionId, mockUserId),
      url: `api/session/${mockSessionId}/participate/${mockUserId}`,
      method: 'POST',
      body: null,
      mockResponse: null,
    });
  });

  it('should UNPARTICIPATE to a session', () => {
    expectHttpRequest({
      observable: service.unParticipate(mockSessionId, mockUserId),
      url: `api/session/${mockSessionId}/participate/${mockUserId}`,
      method: 'DELETE',
      body: null,
      mockResponse: null,
    });
  });
});
