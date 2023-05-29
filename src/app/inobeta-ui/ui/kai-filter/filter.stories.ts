import { StorybookTranslateModule } from ".storybook/i18n";
import { MatNativeDateModule } from "@angular/material/core";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { Meta, StoryObj, componentWrapperDecorator, moduleMetadata } from "@storybook/angular";
import { expect } from '@storybook/jest';
import { userEvent, waitFor, within } from "@storybook/testing-library";
import { IbFilter } from "./filter.component";
import { IbFilterModule } from "./filters.module";

const meta: Meta<IbFilter> = {
  title: "IbFilter",
  component: IbFilter,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [
        MatNativeDateModule,
        BrowserAnimationsModule,
        IbFilterModule,
        StorybookTranslateModule,
      ],
    }),
    componentWrapperDecorator(() => `
      <ib-filter (ibFilterUpdated)="ibFilterUpdated($event)">
        <ib-text-filter name="sku">SKU</ib-text-filter>
        <ib-number-filter name="price">Prezzo</ib-number-filter>
        <ib-tag-filter name="category" [options]="['shirts', 'jeans']">Categoria</ib-tag-filter>
        <ib-date-filter name="created_at">Aggiunto il</ib-date-filter>
      </ib-filter>
    `)
  ],
};

export default meta;
type Story = StoryObj<IbFilter>;

export const Default: Story = {};

export const SetTextFilter: Story = {
  play: async ({ args, canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('set text filter', async () => {
      await userEvent.click(canvas.getByText('SKU'))

      const cdkOverlay = within(document.querySelector('div.cdk-overlay-container'))
      await userEvent.selectOptions
      await userEvent.click(cdkOverlay.getByText('Condizione'));
      await userEvent.click(cdkOverlay.getByText('Uguale a'));
      await userEvent.type(cdkOverlay.getByText('Valore'), 'MY-SKU-000');

      await userEvent.click(cdkOverlay.getByText('Aggiorna'));
    })

    await waitFor(() => {
      expect(args.ibFilterUpdated).toHaveBeenCalled()
    })
  }
}