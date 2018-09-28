/*import { inject, TestBed} from '@angular/core/testing';
import {MODULES} from '../../../index';
import {RouterTestingModule} from '@angular/router/testing';
import {w4tchRoutes} from '../../../../routing.module';
import {SERVICES} from '../../../../services/index';
import {BaseRequestOptions, Http, XHRBackend} from '@angular/http';
import {MockBackend} from '@angular/http/testing';
import {ToasterService} from 'angular2-toaster';
import {ToasterServiceMock} from '../../../../testUtils/toasterServiceMock';
import {ResponseHandlerServiceMock} from '../../../../testUtils/responseHandlerServiceMock';
import {ResponseHandlerService} from '../../../../services/http/responseHandler.service';
import {VIEWS} from '../../../../views/index';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {MapComponent} from './map.component';
import {AuthService} from '../../../../services/auth/auth.service';
import {AuthMock} from '../../../../testUtils/authMock';
import {SessionService} from '../../../../services/auth/session.service';

describe('MapComponent', () => {



  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ...SERVICES,
        MockBackend,
        BaseRequestOptions,
        {
          provide: AuthService,
          useFactory: () => new AuthMock(1)
        },
        {
          provide: Http,
          useFactory: (backend, options) => new Http(backend, options),
          deps: [MockBackend, BaseRequestOptions]
        },
        {
          provide: ToasterService,
          useFactory: () => new ToasterServiceMock()
        },
        {
          provide: ResponseHandlerService,
          useFactory: () => new ResponseHandlerServiceMock()
        },
        { provide: XHRBackend, useClass: MockBackend }
      ],
      declarations: [
        ...VIEWS
      ],
      imports: [
        ...MODULES,
        RouterTestingModule.withRoutes(w4tchRoutes)
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });
    TestBed.compileComponents();
  });


  it('should init', inject([ MockBackend, SessionService], (mockBackend, session) => {

    expect(session).toBeDefined();

    const fixture = TestBed.createComponent(MapComponent);
    const comp = fixture.debugElement.componentInstance;
    expect(comp).toBeTruthy();
    comp.points = [
      { x: 15.087098, y:37.502509, id: 1, payload: 'CATANIA'},
      { x: 12.0382923, y: 44.222645, id: 2, payload: 'FIRENZE' },
      { x: 11.2946648, y: 43.7737912, id: 3, payload: 'FORLI' }
    ];
    comp.width = 300;
    comp.height = 300;
    fixture.detectChanges();
  }));

});
*/
