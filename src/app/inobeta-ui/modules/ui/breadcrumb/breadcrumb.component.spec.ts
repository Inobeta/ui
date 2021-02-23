import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IbBreadcrumbComponent } from './breadcrumb.component';
import { MatIconModule } from '@angular/material';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

xdescribe('IbBreadcrumbComponent', () => {
  let component: IbBreadcrumbComponent;
  let fixture: ComponentFixture<IbBreadcrumbComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IbBreadcrumbComponent ],
      imports: [
        CommonModule,
        RouterModule,
        TranslateModule.forChild({
            extend: true
        })
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IbBreadcrumbComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
