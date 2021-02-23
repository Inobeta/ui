import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IbMaterialBreadcrumbComponent } from './material-breadcrumb.component';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material';
import { of } from 'rxjs';

xdescribe('IbMaterialBreadcrumbComponent', () => {
  let component: IbMaterialBreadcrumbComponent;
  let fixture: ComponentFixture<IbMaterialBreadcrumbComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IbMaterialBreadcrumbComponent ],
      imports: [
        CommonModule,
        RouterModule,
        TranslateModule.forChild({
            extend: true
        }),
        MatIconModule
      ],
      providers:[
        { provide: Router, useValue: {
          events: of([])
        }},
        { provide: ActivatedRoute, useValue: {}},
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IbMaterialBreadcrumbComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
