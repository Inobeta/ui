import { TestBed } from "@angular/core/testing";
import { MatLegacySnackBarModule as MatSnackBarModule } from "@angular/material/legacy-snack-bar";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { IbToolTestModule } from "../../tools";
import { IbToastNotification } from "./toast.service";


describe('IbToastNotification', () => {

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        IbToastNotification
      ],
      imports: [
        IbToolTestModule,
        MatSnackBarModule,
        NoopAnimationsModule
      ]
    }).compileComponents();
  });

  it('should be created', () => {
    const service = TestBed.inject(IbToastNotification);
    expect(service).toBeTruthy();
  });

  it('should open a toast', () => {
    const service = TestBed.inject(IbToastNotification);
    service.open('toastMessage')
    expect(service).toBeTruthy();
  });
});
