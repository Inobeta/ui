import { StorybookTranslateModule } from ".storybook/i18n";
import { MatTableDataSource } from "@angular/material/table";
import { provideAnimations } from "@angular/platform-browser/animations";
import {
  Meta,
  StoryObj,
  applicationConfig,
  moduleMetadata,
} from "@storybook/angular";
import { IbDataExportModule } from "../data-export";
import { IbFilterModule } from "../kai-filter";
import { IbTableActionModule } from "./action";
import { IbTable } from "./table.component";
import { IbKaiTableModule } from "./table.module";

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

const meta: Meta = {
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
    dataSource: { control: { disable: true } },
  },
};

export default meta;
type Story = StoryObj<IbTable>;

export const Simple: Story = {
  args: {
    dataSource: new MatTableDataSource(tableData),
    displayedColumns: ["sku", "price", "category", "created_at"],
  },
  render: (args) => ({
    props: args,
    template: `
      <ib-kai-table tableName="products" [displayedColumns]="displayedColumns" [dataSource]="dataSource">
        <ib-text-column headerText="SKU" name="sku"></ib-text-column>
        <ib-number-column headerText="Prezzo" name="price"></ib-number-column>
        <ib-text-column headerText="Categoria" name="category"></ib-text-column>
        <ib-date-column headerText="Aggiunto il" name="created_at"></ib-date-column>
      </ib-kai-table>
    `,
  }),
};

export const WithFilters: Story = {
  args: {
    dataSource: new MatTableDataSource(tableData),
    displayedColumns: ["sku", "price", "category", "created_at"],
  },
  render: (args) => ({
    props: args,
    template: `
      <ib-kai-table tableName="daje" [displayedColumns]="displayedColumns" [dataSource]="dataSource">
        <ib-filter>
          <ib-text-filter name="sku">SKU</ib-text-filter>
          <ib-number-filter name="price" [step]="0.01">Prezzo</ib-number-filter>
          <ib-tag-filter name="category" [options]="['shirts', 'jeans']">Categoria</ib-tag-filter>
          <ib-date-filter name="created_at">Aggiunto il</ib-date-filter>
        </ib-filter>

        <ib-text-column headerText="SKU" name="sku"></ib-text-column>
        <ib-number-column headerText="Prezzo" name="price"></ib-number-column>
        <ib-text-column headerText="Categoria" name="category"></ib-text-column>
        <ib-date-column headerText="Aggiunto il" name="created_at"></ib-date-column>
      </ib-kai-table>
    `,
  }),
};

export const WithExport: Story = {
  args: {
    dataSource: new MatTableDataSource(tableData),
    displayedColumns: ["sku", "price", "category", "created_at"],
  },
  render: (args) => ({
    props: args,
    template: `
      <ib-kai-table tableName="products" [displayedColumns]="displayedColumns" [dataSource]="dataSource">
        <ib-table-action-group>
          <ib-table-data-export-action></ib-table-data-export-action>
        </ib-table-action-group>

        <ib-text-column headerText="SKU" name="sku"></ib-text-column>
        <ib-number-column headerText="Prezzo" name="price"></ib-number-column>
        <ib-text-column headerText="Categoria" name="category"></ib-text-column>
        <ib-date-column headerText="Aggiunto il" name="created_at"></ib-date-column>
      </ib-kai-table>
    `,
  }),
};
