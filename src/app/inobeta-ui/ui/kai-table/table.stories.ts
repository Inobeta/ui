import { StorybookTranslateModule } from ".storybook/i18n";
import { Meta, StoryObj, applicationConfig, moduleMetadata } from "@storybook/angular";
import { IbTable } from "./table.component";
import { IbKaiTableModule } from "./table.module";
import { useColumn, useDateColumn } from "./cells";
import { IbFilterModule } from "../kai-filter";
import { provideAnimations } from "@angular/platform-browser/animations";

const meta: Meta<IbTable> = {
  title: "IbTable",
  component: IbTable,
  tags: ["autodocs"],
  decorators: [
    moduleMetadata({
      imports: [
        IbKaiTableModule,
        IbFilterModule,
        StorybookTranslateModule,
      ],
    }),
    applicationConfig({
      providers: [provideAnimations()]
    })
  ],
  argTypes: {
    ibRowClicked: { control: { disable: true } },
  },
};

export default meta;
type Story = StoryObj<IbTable>;

const tableData = [
  {
    sku: "J-100",
    price: 14.7,
    category: "jeans",
    created_at: new Date(),
  },
  {
    sku: "S-200",
    price: 18.2,
    category: "shirts",
    created_at: new Date(),
  },
];

export const Simple: Story = {
  args: {
    columns: [
      useColumn("SKU", "sku"),
      useColumn("Prezzo", "price"),
      useColumn("Categoria", "category"),
      useDateColumn("Aggiunto il", "created_at"),
    ],
    data: tableData,
  },
};

export const WithFilters: Story = {
  args: {
    columns: [
      useColumn("SKU", "sku"),
      useColumn("Prezzo", "price"),
      useColumn("Categoria", "category"),
      useDateColumn("Aggiunto il", "created_at"),
    ],
    data: tableData,
  },
  render: (args) => ({
    props: args,
    template: `
      <ib-kai-table [columns]="columns" [data]="data">
        <ib-filter>
          <ib-text-filter name="sku">SKU</ib-text-filter>
          <ib-number-filter name="price" [step]="0.01">Prezzo</ib-number-filter>
          <ib-tag-filter name="category" [options]="['shirts', 'jeans']">Categoria</ib-tag-filter>
          <ib-date-filter name="created_at">Aggiunto il</ib-date-filter>
        </ib-filter>
      </ib-kai-table>
    `,
  }),
};
