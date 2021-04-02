import { TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IbToolTestModule } from '../../tools/tools-test.module';
import { IbModalMessageComponent } from './modal-message.component';
import { IbModalMessageService } from './modal-message.service';


describe('IbModalMessageService', () => {
  beforeEach(() => TestBed.configureTestingModule({
      providers: [IbModalMessageService],
      imports: [MatDialogModule, NoopAnimationsModule, IbToolTestModule],
      declarations: [IbModalMessageComponent]
    })
    .overrideModule(BrowserDynamicTestingModule, {
      set: {
        entryComponents: [
          IbModalMessageComponent
        ],
      }
    })
  );

  it('should be created', () => {
    const service: IbModalMessageService = TestBed.get(IbModalMessageService);
    expect(service).toBeTruthy();
  });


  it('should works when show', () => {
    const service: IbModalMessageService = TestBed.get(IbModalMessageService);
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
