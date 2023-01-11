import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { IbMainMenuDataSet } from '../../models/main-menu-data-set.model';

import { IbMainMenuBarComponent } from './main-menu-bar.component';

describe('IbMainMenuBarComponent', () => {
  let component: IbMainMenuBarComponent;
  let fixture: ComponentFixture<IbMainMenuBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IbMainMenuBarComponent ],
      imports: [
        MatDialogModule
      ],
      providers: [
        {
          provide: MatDialogRef,
          useValue: {}
        }
     ],
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
