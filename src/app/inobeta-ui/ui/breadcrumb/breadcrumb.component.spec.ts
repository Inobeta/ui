import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IbBreadcrumbComponent } from './breadcrumb.component';
import { MatIconModule } from '@angular/material';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { RouterTestingModule } from '@angular/router/testing';
import { Component } from '@angular/core';



@Component({
  selector: 'host-test',
  template: `
  <ib-breadcrumb></ib-breadcrumb>
  `
})

export class TestHostComponent {
}



describe('IbBreadcrumbComponent', () => {
  let component: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;
  const routerSpy = { navigate: jasmine.createSpy('navigate')};
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IbBreadcrumbComponent, TestHostComponent ],
      imports: [
        CommonModule,
        TranslateModule.forChild({
            extend: true
        }),
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
    router.navigate(['test-host'])
  });

  it('should navigate with data', () => {
    expect(component).toBeTruthy();

    const router = TestBed.get(Router);
    router.navigate(['test-host-with-data'])
  });
});
