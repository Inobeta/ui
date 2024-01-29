import { StorybookTranslateModule } from ".storybook/i18n";
import { HttpClientModule } from "@angular/common/http";
import { MatNativeDateModule } from "@angular/material/core";
import { provideAnimations } from "@angular/platform-browser/animations";
import { Meta, StoryObj, applicationConfig, moduleMetadata } from "@storybook/angular";
import { IbFilter } from "./filter.component";
import { IbFilterModule } from "./filters.module";

const meta: Meta<IbFilter> = {
  title: "Components/Filter",
  component: IbFilter,
  tags: ["autodocs"],
  decorators: [
    moduleMetadata({
      imports: [
        MatNativeDateModule,
        IbFilterModule,
        HttpClientModule,
        StorybookTranslateModule,
      ],
    }),
    applicationConfig({
      providers: [provideAnimations()],
    }),
  ],
  argTypes: {
    ibFilterUpdated: { control: { disable: true } },
    ibRawFilterUpdated: { control: { disable: true } },
  },
};

export default meta;
type Story = StoryObj<IbFilter>;

const renderWithSearchBar = (args) => ({
  props: args,
  template: `
  <ib-filter (ibFilterUpdated)="ibFilterUpdated($event)">
    <ib-search-bar></ib-search-bar>
  </ib-filter>`,
});

export const WithSearchBar: Story = {
  render: renderWithSearchBar,
};

const renderWithFilters = (args) => ({
  props: args,
  template: `
  <ib-filter (ibFilterUpdated)="ibFilterUpdated($event)">
    <ib-text-filter name="sku">SKU</ib-text-filter>
    <ib-number-filter name="price">Prezzo</ib-number-filter>
    <ib-tag-filter name="category" [options]="['shirts', 'jeans']">Categoria</ib-tag-filter>
    <ib-date-filter name="created_at">Aggiunto il</ib-date-filter>
  </ib-filter>
  `,
});

export const WithFilters: Story = {
  render: renderWithFilters,
};
