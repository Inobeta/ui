import { StorybookTranslateModule } from ".storybook/i18n";
import { HttpClient, HttpClientModule } from "@angular/common/http";
import {
  Component,
  Input,
  inject,
} from "@angular/core";
import {  provideState, provideStore } from "@ngrx/store";
import {
  Meta,
  StoryObj,
  applicationConfig,
  moduleMetadata,
} from "@storybook/angular";
import { IbHttpModule, ibLoaderFeature } from "public_api";
import { provideAnimations } from "@angular/platform-browser/animations";
import { MatButtonModule } from "@angular/material/button";

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
      declarations: [],
      imports: [
        StorybookTranslateModule,
        IbHttpModule,
        MatButtonModule,
      ],
    }),
    applicationConfig({
      providers: [
        provideStore(),
        provideState(ibLoaderFeature),
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
