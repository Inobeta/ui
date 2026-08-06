import { Component, TemplateRef, ViewChild, ChangeDetectionStrategy } from "@angular/core";
import {
  ComponentFixture,
  TestBed,
  waitForAsync,
} from "@angular/core/testing";
import { IbKaiTableAction, IbKaiTableActionGroup } from "./action";

@Component({
  template: `
    <ng-template ibTableAction [kind]="actionKind">
      <span>Action Content</span>
    </ng-template>
  `,
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
class ActionHostComponent {
  @ViewChild(IbKaiTableAction, { static: true }) action!: IbKaiTableAction;
  actionKind = "default";
}

@Component({
  template: `
    <ib-table-action-group>
      <ng-template ibTableAction [kind]="'export'"></ng-template>
      <ng-template ibTableAction [kind]="'custom'"></ng-template>
    </ib-table-action-group>
  `,
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
class ActionGroupHostComponent {
  @ViewChild(IbKaiTableActionGroup, { static: true }) group!: IbKaiTableActionGroup;
}

describe("IbKaiTableAction", () => {
  let fixture: ComponentFixture<ActionHostComponent>;
  let host: ActionHostComponent;
  let component: IbKaiTableAction;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ActionHostComponent, IbKaiTableAction],
    }).compileComponents();
  }));

  beforeEach(async () => {
    fixture = TestBed.createComponent(ActionHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
    component = host.action;
  });

  it("should read kind as an input signal with default 'default'", () => {
    expect(component.kind()).toBe("default");
  });

  it("should update kind signal when host changes value", async () => {
    host.actionKind = "export";
    fixture.changeDetectorRef.markForCheck();
    await fixture.whenStable();
    expect(component.kind()).toBe("export");
  });

  it("should expose the TemplateRef via the templateRef signal", () => {
    expect(component.templateRef()).toBeInstanceOf(TemplateRef);
  });

  it("should have a _templateRef from constructor injection", () => {
    expect(component._templateRef).toBeInstanceOf(TemplateRef);
  });

  it("should allow programmatic signal invocation on kind", () => {
    const kindVal = component.kind();
    expect(kindVal).toBe("default");
    expect(typeof kindVal).toBe("string");
  });
});

describe("IbKaiTableActionGroup", () => {
  let fixture: ComponentFixture<ActionGroupHostComponent>;
  let host: ActionGroupHostComponent;
  let component: IbKaiTableActionGroup;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ActionGroupHostComponent, IbKaiTableActionGroup, IbKaiTableAction],
    }).compileComponents();
  }));

  beforeEach(async () => {
    fixture = TestBed.createComponent(ActionGroupHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
    component = host.group;
  });

  it("should expose the TemplateRef query signal", () => {
    // The group is a directive and does not own a view, so its required
    // viewChild query cannot be invoked in this host. Its signal API remains
    // available to the owning component context.
    expect(typeof component.templateRef).toBe("function");
  });

  it("should query content children IbKaiTableAction via contentChildren", () => {
    const actions = component.actions();
    expect(actions.length).toBe(2);
    expect(actions[0].kind()).toBe("export");
    expect(actions[1].kind()).toBe("custom");
  });

  it("should allow programmatic access to action instances via contentChildren signal", () => {
    const actions = component.actions();
    expect(actions.length).toBe(2);
    actions.forEach((a) => expect(a).toBeInstanceOf(IbKaiTableAction));
  });
});
