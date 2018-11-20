import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LocationViewerComponent } from './location-viewer.component';

describe('LocationViewerComponent', () => {
  let component: LocationViewerComponent;
  let fixture: ComponentFixture<LocationViewerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LocationViewerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LocationViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
