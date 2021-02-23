import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MaterialBreadcrumbComponent } from './material-breadcrumb.component';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material';
import { of } from 'rxjs';

xdescribe('MaterialBreadcrumbComponent', () => {
  let component: MaterialBreadcrumbComponent;
  let fixture: ComponentFixture<MaterialBreadcrumbComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MaterialBreadcrumbComponent ],
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
    fixture = TestBed.createComponent(MaterialBreadcrumbComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
