import { NgModule } from '@angular/core';
import { SpinnerLoadingStubComponent } from './http/spinner-loading.stub.spec';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { IbLoginServiceStub } from './auth/login.service.stub.spec';
import { IbLoginService } from './auth/login.service';
import { IbLoadingStubDirective } from './http/loading-skeleton.directive.stub.spec';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';


@NgModule({ exports: [
        SpinnerLoadingStubComponent,
        IbLoadingStubDirective
    ],
    declarations: [
        SpinnerLoadingStubComponent,
        IbLoadingStubDirective
    ], imports: [], providers: [
        { provide: IbLoginService, useClass: IbLoginServiceStub },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
    ] })
export class IbHttpTestModule { }
