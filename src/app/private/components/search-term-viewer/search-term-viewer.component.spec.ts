import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchTermViewerComponent } from './search-term-viewer.component';

describe('SearchTermViewerComponent', () => {
  let component: SearchTermViewerComponent;
  let fixture: ComponentFixture<SearchTermViewerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SearchTermViewerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchTermViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
