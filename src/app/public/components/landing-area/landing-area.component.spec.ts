import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LandingAreaComponent } from './landing-area.component';

describe('LandingAreaComponent', () => {
  let component: LandingAreaComponent;
  let fixture: ComponentFixture<LandingAreaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LandingAreaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LandingAreaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
