import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomMaterialFormComponent } from './custom-material-form.component';

describe('CustomMaterialFormComponent', () => {
  let component: CustomMaterialFormComponent;
  let fixture: ComponentFixture<CustomMaterialFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomMaterialFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomMaterialFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
