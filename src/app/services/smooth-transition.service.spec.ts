import { TestBed } from '@angular/core/testing';

import { SmoothTransitionService } from './smooth-transition.service';

describe('SmoothTransitionService', () => {
  let service: SmoothTransitionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SmoothTransitionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
