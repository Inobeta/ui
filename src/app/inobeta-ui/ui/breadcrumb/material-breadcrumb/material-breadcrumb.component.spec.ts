import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IbMaterialBreadcrumbComponent } from './material-breadcrumb.component';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { of } from 'rxjs';
import { Component } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';


@Component({
  selector: 'host-test',
  template: `
  <ib-material-breadcrumb></ib-material-breadcrumb>
  `
})

export class TestHostComponent {
}




describe('IbMaterialBreadcrumbComponent', () => {
  let component: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IbMaterialBreadcrumbComponent, TestHostComponent ],
      imports: [
        CommonModule,
        RouterModule,
        TranslateModule.forChild({
            extend: true
        }),
        MatIconModule,
        RouterTestingModule.withRoutes([
          { path: 'test-host', component: TestHostComponent},
          { path: 'test-host-with-data', data: { breadcrumb: 'Data' }, component: TestHostComponent},
        ])
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should navigate without data', () => {
    expect(component).toBeTruthy();

    const router = TestBed.get(Router);
    router.navigate(['test-host']);
  });

  it('should navigate with data', () => {
    expect(component).toBeTruthy();

    const router = TestBed.get(Router);
    router.navigate(['test-host-with-data']);
  });
});
