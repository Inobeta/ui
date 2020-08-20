import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MaterialFormControlComponent } from './material-form-control.component';

describe('MaterialFormControlComponent', () => {
  let component: MaterialFormControlComponent;
  let fixture: ComponentFixture<MaterialFormControlComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MaterialFormControlComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MaterialFormControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
