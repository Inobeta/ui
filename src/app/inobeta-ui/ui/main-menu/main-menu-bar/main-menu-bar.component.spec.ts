import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IbMainMenuBarComponent } from './main-menu-bar.component';

describe('IbMainMenuBarComponent', () => {
  let component: IbMainMenuBarComponent;
  let fixture: ComponentFixture<IbMainMenuBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IbMainMenuBarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IbMainMenuBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
