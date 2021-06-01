import { TestBed } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IbToolTestModule } from '../../tools/tools-test.module';
import { IbModalMessageComponent } from './modal-message.component';
import { IbModalMessageService } from './modal-message.service';


describe('IbModalMessageService', () => {
  beforeEach(() => TestBed.configureTestingModule({
      providers: [IbModalMessageService],
      imports: [
        MatDialogModule,
        NoopAnimationsModule,
        IbToolTestModule,
        MatButtonModule
      ],
      declarations: [IbModalMessageComponent]
    })
  );

  it('should be created', () => {
    const service: IbModalMessageService = TestBed.inject(IbModalMessageService);
    expect(service).toBeTruthy();
  });


  it('should works when show', () => {
    const service: IbModalMessageService = TestBed.inject(IbModalMessageService);
    service.show({
      title: 'Test',
      message: 'Message'
    })

    service.show({
      title: 'Test',
      message: 'Message',
      hasYes: false,
      hasNo: false
    })


  });
});
