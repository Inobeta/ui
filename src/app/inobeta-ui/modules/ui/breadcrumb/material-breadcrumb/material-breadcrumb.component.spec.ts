import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MaterialBreadcrumbComponent } from './material-breadcrumb.component';

describe('MaterialBreadcrumbComponent', () => {
  let component: MaterialBreadcrumbComponent;
  let fixture: ComponentFixture<MaterialBreadcrumbComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MaterialBreadcrumbComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MaterialBreadcrumbComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
