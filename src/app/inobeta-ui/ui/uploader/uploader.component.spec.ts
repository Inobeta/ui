import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';

import { IbUploaderComponent } from '.';

describe('IbUploaderComponent', () => {
  let component: IbUploaderComponent;
  let fixture: ComponentFixture<IbUploaderComponent>;
  let fileInput: HTMLInputElement;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        IbUploaderComponent,
        NoopAnimationsModule,
        TranslateModule.forRoot(),
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IbUploaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    fileInput = fixture.debugElement.query(By.css('input[type="file"]')).nativeElement;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should delegate button clicks to the hidden file input', () => {
    const clickSpy = spyOn(fileInput, 'click');

    fixture.debugElement.query(By.css('button')).nativeElement.click();

    expect(clickSpy).toHaveBeenCalled();
  });

  it('should emit the selected file and reset the native input', () => {
    const selectedFile = new File(['content'], 'document.txt', { type: 'text/plain' });
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(selectedFile);
    fileInput.files = dataTransfer.files;
    let emittedFile: File | undefined;
    component.fileSelected.subscribe((file) => emittedFile = file);

    fileInput.dispatchEvent(new Event('change'));

    expect(emittedFile).toBe(selectedFile);
    expect(fileInput.value).toBe('');
  });

  it('should not emit when no file is present', () => {
    let emitted = false;
    component.fileSelected.subscribe(() => emitted = true);

    fileInput.dispatchEvent(new Event('change'));

    expect(emitted).toBeFalse();
  });
});
