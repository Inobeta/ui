import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IbMainMenuDialogComponent } from './main-menu-dialog.component';

describe('IbMainMenuDialogComponent', () => {
  let component: IbMainMenuDialogComponent;
  let fixture: ComponentFixture<IbMainMenuDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IbMainMenuDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IbMainMenuDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
