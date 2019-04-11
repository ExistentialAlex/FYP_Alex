import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchTermViewerPageComponent } from './search-term-viewer-page.component';

describe('SearchTermViewerPageComponent', () => {
  let component: SearchTermViewerPageComponent;
  let fixture: ComponentFixture<SearchTermViewerPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SearchTermViewerPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchTermViewerPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
