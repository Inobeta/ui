import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateFakeLoader, TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { IbMainMenuDataSet } from '../../models/main-menu-data-set.model';

import { IbMainMenuExpandedComponent } from './main-menu-expanded.component';

describe('IbMainMenuExpandedComponent', () => {
  let component: IbMainMenuExpandedComponent;
  let fixture: ComponentFixture<IbMainMenuExpandedComponent>;
  let data: IbMainMenuDataSet = {
    title: '',
    topCenter: { link: '', label: '', icon: { label:'', type:''}},
    upRight: [],
    navData: [],
    bottomRight: '',
    bottomLeft: { link: '', label: '', icon: { label:'', type:''}}
  };


  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        IbMainMenuExpandedComponent,
      ],
      imports: [
        RouterTestingModule,
        MatDialogModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: TranslateFakeLoader
          }
        }),      ],
      providers: [
        {
          provide: MatDialogRef,
          useValue: {}
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: {}
        }
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IbMainMenuExpandedComponent);
    component = fixture.componentInstance;
    component.navDataSet = data;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});


