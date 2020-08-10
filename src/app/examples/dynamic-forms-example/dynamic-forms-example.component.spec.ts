import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DynamicFormsExampleComponent } from './dynamic-forms-example.component';

describe('DynamicFormsExampleComponent', () => {
  let component: DynamicFormsExampleComponent;
  let fixture: ComponentFixture<DynamicFormsExampleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DynamicFormsExampleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DynamicFormsExampleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
