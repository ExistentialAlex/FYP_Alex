import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LocationViewerPageComponent } from './location-viewer-page.component';

describe('LocationViewerPageComponent', () => {
  let component: LocationViewerPageComponent;
  let fixture: ComponentFixture<LocationViewerPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LocationViewerPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LocationViewerPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
