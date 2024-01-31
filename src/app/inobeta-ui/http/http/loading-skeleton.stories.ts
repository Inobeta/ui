import { StorybookTranslateModule } from ".storybook/i18n";
import { HttpClient, HttpClientModule } from "@angular/common/http";
import {
  Component,
  Input,
  OnInit,
  importProvidersFrom,
  inject,
} from "@angular/core";
import { Store, StoreModule, combineReducers } from "@ngrx/store";
import {
  Meta,
  StoryObj,
  applicationConfig,
  moduleMetadata,
} from "@storybook/angular";
import { IbHttpModule } from "../http.module";
import { ibHttpReducers } from "../store";
import { provideAnimations } from "@angular/platform-browser/animations";
import { MatButtonModule } from "@angular/material/button";

const reducers = {
  ibHttpState: combineReducers(ibHttpReducers),
};

@Component({
  selector: "ib-loading-screen",
  template: `
    <button mat-flat-button (click)="reload()">Reload</button>
    <section *ibLoading="props">Hello 👋</section>
  `,
})
export class IbLoadingScreen {
  /** @ignore */
  private http = inject(HttpClient);
  @Input() props: Record<string, any> = {};

  constructor() {}

  reload() {
    this.http.get("./assets/i18n/it.json").subscribe();
  }
}

const meta: Meta<IbLoadingScreen> = {
  title: "Features/HTTP",
  component: IbLoadingScreen,
  decorators: [
    moduleMetadata({
      declarations: [IbLoadingScreen],
      imports: [
        HttpClientModule,
        StorybookTranslateModule,
        IbHttpModule,
        MatButtonModule,
      ],
    }),
    applicationConfig({
      providers: [
        importProvidersFrom(StoreModule.forRoot(reducers)),
        provideAnimations(),
      ],
    }),
  ],
  parameters: {
    controls: {
      include: ["props"],
    },
  },
};

export default meta;
type Story = StoryObj<IbLoadingScreen>;

export const loadingDirective: Story = {
  args: {
    props: { size: 4 },
  },
};
