import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { IbMainMenuDataSet } from '../../models/main-menu-data-set.model';

import { IbMainMenuDialogComponent } from './main-menu-dialog.component';

describe('IbMainMenuDialogComponent', () => {
  let component: IbMainMenuDialogComponent;
  let fixture: ComponentFixture<IbMainMenuDialogComponent>;
  let data: IbMainMenuDataSet = {
    title: '',
    upRight: [],
    topCenter: { link: '', label: '', icon: { label:'', type:''}},
    navData: [],
    bottomRight: '',
    bottomLeft: { link: '', label: '', icon: {label:'',type:''}}

  };


  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IbMainMenuDialogComponent ],
      imports: [
        MatDialogModule,
        RouterTestingModule
      ],
      providers: [
        {
          provide: MatDialogRef,
          useValue: {}
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: data
        }
     ],
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
