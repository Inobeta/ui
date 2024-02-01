import { StorybookTranslateModule } from ".storybook/i18n";
import { DatePipe, registerLocaleData } from "@angular/common";
import localeIt from "@angular/common/locales/it";
import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
} from "@angular/core";
import { MatIconModule } from "@angular/material/icon";
import { MatSortModule } from "@angular/material/sort";
import { MatTableModule } from "@angular/material/table";
import { MatTooltipModule } from "@angular/material/tooltip";
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
import { IbColumn } from "./columns/column";
import { IbSortHeader } from "./sort-header";
import { IbTable } from "./table.component";
import { IbKaiTableModule } from "./table.module";
import { IB_AGGREGATE_TYPE, IB_COLUMN } from "./tokens";

const origin = new Date("2024-01-01");
const colors = ["Black", "Purple", "Brown", "Cyan", "White", "Pink"];
const productsByCategory = {
  Shirts: ["T-Shirt", "Shirt"],
  Knitwear: ["Sweater", "Cape", "Cardigan"],
  Trousers: ["Jeans", "Pants"],
  Skirts: ["Skirt", "Shorts"],
  Shoes: ["Sneakers", "Boots"],
};
const categories = Object.keys(productsByCategory);

function getColor(id) {
  return colors[id % colors.length];
}

function getProduct(id) {
  const category = categories[id % categories.length];
  const p = productsByCategory[category];
  const name = p[id % p.length];
  return { name, category };
}

function generateData() {
  return Array(100)
    .fill({})
    .map((_, id) => {
      const p = getProduct(id);

      return {
        id: id + 1,
        name: `${getColor(id)} ${p.name}`,
        description: "The quick brown fox jumps over the lazy dog",
        sku: `${p.category.at(0)}${p.name.at(0)}-${id + 1}00`,
        category: p.category,
        price: ((id + 1) * 5 - 0.01) % 100,
        created_at: origin.setHours((id + 1) % 50),
        created_at_secs: { seconds: origin.getTime() / 1000 },
      };
    });
}

const tableData = generateData();

registerLocaleData(localeIt);

@Component({
  selector: "ib-timestamp-column",
  template: `<ng-container
    matColumnDef
    matSort
    [sticky]="sticky"
    [stickyEnd]="stickyEnd"
  >
    <!-- ibSortHeaderFor: Replaces the temporary \`matSort\` instance with the one declared in the table component -->
    <th
      class="ib-table__header-cell"
      mat-header-cell
      *matHeaderCellDef
      [ibSortHeaderFor]="matSort"
      mat-sort-header
      [disabled]="!sort"
    >
      {{ headerText }}
    </th>
    <td
      mat-cell
      *matCellDef="let data"
      [matTooltip]="dataAccessor(data, name) + ' ms'"
    >
      {{ dataAccessor(data, name) | date : "MMM d, YYYY 'at' hh:mm" }}
    </td>
    <td mat-footer-cell *matFooterCellDef style="max-width: fit-content">
      <ib-aggregate *ngIf="aggregate"></ib-aggregate>
    </td>
  </ng-container>`,
  // View encapsulation must be removed so that the styles can be applied accordingly.
  encapsulation: ViewEncapsulation.None,
  // Ensure that no change detection related exception will be thrown.
  changeDetection: ChangeDetectionStrategy.Default,
  providers: [
    // Provide both `IbColumn` and `IB_COLUMN` tokens.
    // Make sure that the parent table and any descendant
    // can access this column.
    { provide: IbColumn, useExisting: IbTimestampColumn },
    { provide: IB_COLUMN, useExisting: IbTimestampColumn },
    // Provide a valid `IB_AGGREGATE_TYPE` token value to support aggregation
    { provide: IB_AGGREGATE_TYPE, useValue: "date" },
  ],
  standalone: true,
  imports: [
    MatTableModule,
    MatSortModule,
    MatIconModule,
    MatTooltipModule,
    IbSortHeader,
    DatePipe,
  ],
})
export class IbTimestampColumn<T> extends IbColumn<T> {
  dataAccessor = (data: T, name: string): any => data[name].seconds * 1000;
}

const meta: Meta = {
  title: "Components/Table",
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
        IbTimestampColumn,
      ],
    }),
    applicationConfig({
      providers: [provideAnimations()],
    }),
  ],
  argTypes: {
    dataSource: { control: { disable: true } },
  },
  parameters: {
    controls: {
      include: ["displayedColumns", "data", "tableDef", "tableName"],
    },
  },
};

export default meta;
type Story = StoryObj<IbTable>;

/**
 * A simple example with two text columns and pagination
 */
export const Simple: Story = {
  args: {
    displayedColumns: ["name", "category"],
    tableDef: {
      paginator: {
        pageSizeOptions: [5, 10, 25, 100],
        showFirstLastButtons: true,
        pageSize: 5,
        hide: false,
      },
    },
  },
  render: (args) => ({
    props: {
      data: tableData,
      ...args,
    },
    template: `
      <ib-kai-table tableName="products" [data]="data" [displayedColumns]="displayedColumns" [tableDef]="tableDef">
        <ib-text-column headerText="Product name" name="name" />
        <ib-text-column name="category" />
      </ib-kai-table>
    `,
  }),
};

export const WithSort: Story = {
  args: {
    displayedColumns: ["id", "name", "sku", "category", "price", "created_at"],
    tableDef: {
      paginator: {
        pageSizeOptions: [5, 10, 25, 100],
        showFirstLastButtons: true,
        pageSize: 5,
      },
    },
  },
  render: (args) => ({
    props: {
      data: tableData,
      ...args,
    },
    template: `
      <ib-kai-table tableName="products" [data]="data" [displayedColumns]="displayedColumns" [tableDef]="tableDef">
        <ib-text-column headerText="ID" name="id" sort />
        <ib-text-column headerText="Product name" name="name" sort />
        <ib-text-column headerText="SKU" name="sku" />
        <ib-number-column name="price" sort />
        <ib-text-column  name="category" sort />
        <ib-date-column headerText="Created at" name="created_at" sort />
      </ib-kai-table>
    `,
  }),
};

export const WithFilters: Story = {
  render: () => ({
    props: {
      data: tableData,
      displayedColumns: [
        "id",
        "name",
        "sku",
        "category",
        "price",
        "created_at",
      ],
    },
    template: `
      <ib-kai-table tableName="products" [displayedColumns]="displayedColumns" [data]="data">
        <ib-filter>
          <ib-text-filter name="name">Product name</ib-text-filter>
          <ib-text-filter name="sku">SKU</ib-text-filter>
          <ib-number-filter name="price" [step]="0.01">Price</ib-number-filter>
          <ib-tag-filter name="category">Category</ib-tag-filter>
          <ib-date-filter name="created_at">Created at</ib-date-filter>
        </ib-filter>

        <ib-text-column headerText="ID" name="id" sort />
        <ib-text-column headerText="Product name" name="name" sort />
        <ib-text-column headerText="SKU" name="sku" />
        <ib-number-column name="price" sort />
        <ib-text-column  name="category" sort />
        <ib-date-column headerText="Created at" name="created_at" sort />
      </ib-kai-table>
    `,
  }),
};

export const WithExport: Story = {
  args: {
    data: tableData,
    displayedColumns: ["id", "name", "sku", "category", "price", "created_at"],
  },
  render: (args) => ({
    props: args,
    template: `
      <ib-kai-table tableName="products" [displayedColumns]="displayedColumns" [data]="data">
        <ib-table-action-group>
          <ib-table-data-export-action />
        </ib-table-action-group>

        <ib-text-column headerText="ID" name="id" sort />
        <ib-text-column headerText="Product name" name="name" sort />
        <ib-text-column headerText="SKU" name="sku" />
        <ib-number-column name="price" sort />
        <ib-text-column  name="category" sort />
        <ib-date-column headerText="Created at" name="created_at" sort />
      </ib-kai-table>
    `,
  }),
};

export const WithCustomColumn: Story = {
  args: {
    displayedColumns: [
      "id",
      "name",
      "sku",
      "category",
      "price",
      "created_at_secs",
    ],
    tableDef: {
      paginator: {
        pageSizeOptions: [5, 10, 25, 100],
        showFirstLastButtons: true,
        pageSize: 5,
      },
    },
  },
  render: (args) => ({
    props: {
      data: tableData,
      ...args,
    },
    template: `
      <ib-kai-table tableName="products" [data]="data" [displayedColumns]="displayedColumns" [tableDef]="tableDef">
        <ib-text-column headerText="ID" name="id" sort />
        <ib-text-column headerText="Product name" name="name" sort />
        <ib-text-column headerText="SKU" name="sku" />
        <ib-number-column name="price" sort />
        <ib-text-column name="category" sort />
        <ib-timestamp-column headerText="Created at (custom)" name="created_at_secs" sort />
      </ib-kai-table>
    `,
  }),
};

/**
 * Example using the `*ibKaiRowGroup` directive.  
 * Click on a row to reveal its content.
 */
export const WithRowGroup: Story = {
  args: {
    displayedColumns: [
      "id",
      "name",
      "sku",
      "category",
      "price",
      "created_at",
    ],
    tableDef: {
      paginator: {
        pageSize: 5
      },
    },
  },
  render: (args) => ({
    props: {
      data: tableData,
      ...args,
    },
    template: `
      <ib-kai-table tableName="products" [data]="data" [displayedColumns]="displayedColumns" [tableDef]="tableDef">
        <ng-container *ibKaiRowGroup="let data">
          Description for {{ data.name }}: {{ data.description }}
        </ng-container>
      
        <ib-text-column headerText="ID" name="id" sort />
        <ib-text-column headerText="Product name" name="name" sort />
        <ib-text-column headerText="SKU" name="sku" />
        <ib-number-column name="price" sort />
        <ib-text-column name="category" sort />
        <ib-date-column headerText="Created at" name="created_at" sort />
      </ib-kai-table>
    `,
  }),
};