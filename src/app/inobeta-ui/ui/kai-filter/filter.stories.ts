import { StorybookTranslateModule } from ".storybook/i18n";
import { MatNativeDateModule } from "@angular/material/core";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { Meta, StoryObj, moduleMetadata } from "@storybook/angular";
import { expect } from "@storybook/jest";
import { userEvent, waitFor, within } from "@storybook/testing-library";
import { IbFilter } from "./filter.component";
import { IbFilterModule } from "./filters.module";

const meta: Meta<IbFilter> = {
  title: "IbFilter",
  component: IbFilter,
  tags: ["autodocs"],
  decorators: [
    moduleMetadata({
      imports: [
        MatNativeDateModule,
        BrowserAnimationsModule,
        IbFilterModule,
        StorybookTranslateModule,
      ],
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
  play: async ({ args, canvasElement, step }) => {
    const canvas = within(canvasElement.parentElement);

    await step("Set text filter", async () => {
      userEvent.click(canvas.getByText("SKU"));
      userEvent.click(canvas.getByText("Condizione"));
      userEvent.click(canvas.getByText("Uguale a"));
      userEvent.type(canvas.getByText("Valore"), "MY-SKU-000");
    });

    await step("Apply filter", async () => {
      userEvent.click(canvas.getByText("Aggiorna"));
    });

    await waitFor(() => {
      expect(args.ibFilterUpdated).toHaveBeenCalled();
    });
  },
};
