import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomMaterialFormControlComponent } from './custom-material-form-control.component';

describe('CustomMaterialFormControlComponent', () => {
  let component: CustomMaterialFormControlComponent;
  let fixture: ComponentFixture<CustomMaterialFormControlComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomMaterialFormControlComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomMaterialFormControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
