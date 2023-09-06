import { StorybookTranslateModule } from ".storybook/i18n";
import {
  Meta,
  StoryObj,
  applicationConfig,
  moduleMetadata,
} from "@storybook/angular";
import { IbTable } from "./table.component";
import { IbKaiTableModule } from "./table.module";
import { useColumn, useDateColumn } from "./cells";
import { IbFilterModule } from "../kai-filter";
import { provideAnimations } from "@angular/platform-browser/animations";
import { IbDataExportModule } from "../data-export";
import { IbTableActionModule } from "./action";
import { MatTableDataSource } from "@angular/material/table";

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

const meta: Meta<IbTable> = {
  title: "IbTable",
  component: IbTable,
  tags: ["autodocs"],
  decorators: [
    moduleMetadata({
      imports: [
        IbKaiTableModule,
        IbFilterModule,
        IbDataExportModule,
        IbTableActionModule,
        StorybookTranslateModule,
      ],
    }),
    applicationConfig({
      providers: [provideAnimations()],
    }),
  ],
  argTypes: {
    ibRowClicked: { control: { disable: true } },
    dataSource: { control: { disable: true } },
  },
};

export default meta;
type Story = StoryObj<IbTable>;

export const Simple: Story = {
  args: {
    columns: [
      useColumn("SKU", "sku"),
      useColumn("Prezzo", "price"),
      useColumn("Categoria", "category"),
      useDateColumn("Aggiunto il", "created_at"),
    ],
    dataSource: new MatTableDataSource(tableData),
  },
  render: (args) => ({
    props: args,
    template: `
      <ib-kai-table tableName="products" [columns]="columns" [dataSource]="dataSource"></ib-kai-table>
    `,
  }),
};

export const WithFilters: Story = {
  args: {
    columns: [
      useColumn("SKU", "sku"),
      useColumn("Prezzo", "price"),
      useColumn("Categoria", "category"),
      useDateColumn("Aggiunto il", "created_at"),
    ],
    dataSource: new MatTableDataSource(tableData),
  },
  render: (args) => ({
    props: args,
    template: `
      <ib-kai-table tableName="products" [columns]="columns" [dataSource]="dataSource">
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

export const WithExport: Story = {
  args: {
    columns: [
      useColumn("SKU", "sku"),
      useColumn("Prezzo", "price"),
      useColumn("Categoria", "category"),
      useDateColumn("Aggiunto il", "created_at"),
    ],
    dataSource: new MatTableDataSource(tableData),
  },
  render: (args) => ({
    props: args,
    template: `
      <ib-kai-table tableName="products" [columns]="columns" [dataSource]="dataSource">
        <ib-table-action-group>
          <ib-table-data-export-action></ib-table-data-export-action>
        </ib-table-action-group>
      </ib-kai-table>
    `,
  }),
};
