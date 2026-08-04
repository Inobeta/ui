import { ComponentFixture, TestBed } from "@angular/core/testing";
import { registerLocaleData } from "@angular/common";
import localeIt from "@angular/common/locales/it";
import { By } from "@angular/platform-browser";
import { provideStore } from "@ngrx/store";
import { RouterTestingModule } from "@angular/router/testing";
import { TranslateModule } from "@ngx-translate/core";
import { of } from "rxjs";
import { IbKaiTableAction, IbTable } from "public_api";
import { IbKaiTableFullExamplePage } from "./kai-table-full-example";
import { IbUserExample, UserService } from "./users";

registerLocaleData(localeIt);

describe("IbKaiTableFullExamplePage", () => {
  let fixture: ComponentFixture<IbKaiTableFullExamplePage>;

  const users: IbUserExample[] = [
    {
      id: "1",
      name: "Ada Lovelace",
      fruit: "apple",
      amount: 10,
      number: 1,
      created_at: "2026-01-01",
      subscribed: true,
    },
  ];

  beforeEach(async () => {
    const userService = {
      getUserOrders: () => of(users),
    };

    await TestBed.configureTestingModule({
      imports: [
        IbKaiTableFullExamplePage,
        RouterTestingModule.withRoutes([]),
        TranslateModule.forRoot(),
      ],
      providers: [provideStore()],
    })
      .overrideComponent(IbKaiTableFullExamplePage, {
        set: { providers: [{ provide: UserService, useValue: userService }] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(IbKaiTableFullExamplePage);
    fixture.detectChanges();
  });

  it("projects export capability action instead of direct export component", () => {
    const table = fixture.debugElement
      .query(By.directive(IbTable))
      .componentInstance as IbTable;
    const actions: readonly IbKaiTableAction[] = table.headerActions();

    expect(actions.map((action) => action.kind())).toContain("export");
    expect(actions.filter((action) => action.kind() === "default").length).toBe(1);
  });
});
