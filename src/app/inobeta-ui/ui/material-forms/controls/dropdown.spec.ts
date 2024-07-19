import { TestBed, waitForAsync } from "@angular/core/testing";

import { Component } from "@angular/core";
import {
  FormsModule,
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
} from "@angular/forms";
import { By } from "@angular/platform-browser";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { TranslateModule } from "@ngx-translate/core";
import { IbToolTestModule } from "../../../tools";
import {
  IbMatDropdownComponent,
  IbMatDropdownControl,
} from "../controls/dropdown";
import { IbMaterialFormModule } from "../material-form.module";
import { HarnessLoader } from "@angular/cdk/testing";
import { TestbedHarnessEnvironment } from "@angular/cdk/testing/testbed";
import { get } from "http";
import { MatSelectHarness } from "@angular/material/select/testing";

@Component({
  selector: "ib-dropdown-app",
  template: ` <ib-material-form [fields]="fields" /> `,
})
class IbDropdownApp {
  fields = [
    new IbMatDropdownControl({
      key: "test",
      options: [
        { key: "test1", value: "value1" },
        { key: "test2", value: "value2" },
      ],
      multiple: true,
      change: () => {},
    }),
  ];
}

describe("IbMatDropdownComponent", () => {
  let component: IbMatDropdownComponent;
  let formBuilder: UntypedFormBuilder;
  let control: UntypedFormControl;
  let loader: HarnessLoader;
  let form: UntypedFormGroup;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [IbDropdownApp],
      imports: [
        IbToolTestModule,
        FormsModule,
        NoopAnimationsModule,
        IbMaterialFormModule,
        TranslateModule.forRoot({
          extend: true,
        }),
      ],
    }).compileComponents();
    formBuilder = TestBed.inject(UntypedFormBuilder);
    control = new UntypedFormControl("control");
    form = formBuilder.group(control);
    const fixture = TestBed.createComponent(IbDropdownApp);
    fixture.detectChanges();
    component = fixture.debugElement.query(
      By.directive(IbMatDropdownComponent)
    ).componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);
  }));

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should select and deselect all", () => {
    const spy = spyOn(component.data.self, "setValue").and.callThrough();
    component.selectAll();
    expect(spy).toHaveBeenCalledWith(["test1", "test2"]);
    spy.calls.reset();
    component.selectAll();
    expect(spy).toHaveBeenCalledWith([]);
    spy.calls.reset();
  });

  it("should handle selection when multiple", async () => {
    const spy = spyOn(component.data.base, "change").and.callThrough();
    const select = await loader.getHarness(MatSelectHarness);
    await select.open();

    await select.clickOptions({ text: "value1" });
    expect(spy).toHaveBeenCalled();
    expect(component.data.self.value).toEqual(["test1"]);
    await select.clickOptions({ text: "shared.ibDropdown.selectAll" });
    expect(spy).toHaveBeenCalled();
    expect(component.data.self.value).toEqual(["test1", "test2"]);
    await select.clickOptions({ text: "shared.ibDropdown.selectNone" });
    expect(spy).toHaveBeenCalled();
    expect(component.data.self.value).toEqual([]);
  });
});
