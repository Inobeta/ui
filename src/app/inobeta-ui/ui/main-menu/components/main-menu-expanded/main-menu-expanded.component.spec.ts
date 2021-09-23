import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IbMainMenuExpandedComponent } from './main-menu-expanded.component';

describe('IbMainMenuExpandedComponent', () => {
  let component: IbMainMenuExpandedComponent;
  let fixture: ComponentFixture<IbMainMenuExpandedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IbMainMenuExpandedComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IbMainMenuExpandedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
