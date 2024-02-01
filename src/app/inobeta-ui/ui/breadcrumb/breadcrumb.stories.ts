import { StorybookTranslateModule } from ".storybook/i18n";
import { NgFor, NgIf } from "@angular/common";
import { Component } from "@angular/core";
import { MatIconModule } from "@angular/material/icon";
import { provideAnimations } from "@angular/platform-browser/animations";
import { RouterTestingModule } from "@angular/router/testing";
import {
  Meta,
  StoryObj,
  applicationConfig,
  moduleMetadata,
} from "@storybook/angular";
import { IbBreadcrumbComponent } from "./breadcrumb.component";
import { IbBreadcrumbModule } from "./breadcrumb.module";

@Component({
  selector: "app-breadbrumb",
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    StorybookTranslateModule,
    RouterTestingModule,
    IbBreadcrumbModule,
    MatIconModule,
  ],
  template: `<ul class="ibBreadcrumbs">
    <li *ngFor="let item of items" class="ibBreadcrumbs-link">
      <p *ngIf="item === items[0]">
        {{ item.label }}
      </p>

      <mat-icon *ngIf="item !== items[0] && item !== items[1]"
        >chevron_right</mat-icon
      >

      <a *ngIf="item !== items[0]" [routerLink]="[item.url]">
        {{ item.label }}
      </a>
    </li>
  </ul>`,
  styles: `
  .ibBreadcrumbs {
    padding: 5px 10px 5px 0px;
    border-radius: 4px;
    margin: 0px;
    list-style: none;
    display: flex;
  }
  .ibBreadcrumbs-link {
    display: flex;
    align-items: center;
  }
  .ibBreadcrumbs-link {
    a {
      background-color: transparent;
      text-decoration: none;
      line-height: 24px;
      padding: 0px;
      margin: 0px;
      height: 33px;
      font-weight: 500;
      font-size: 14px;
      line-height: 14px;
      display: flex;
      align-items: center;
      text-align: center;
      letter-spacing: 0.002em;
      color: #030303;
    }

    a:hover {
      text-decoration: underline;
    }
  }
  .ibBreadcrumbs-link:nth-child(1) {
    font-size: 20px;
    line-height: 22px;
    margin-right: 20px;
    padding: 0px 5px 0px 10px;
  }
  .ibBreadcrumbs-link > mat-icon {
    color: #A3A0A0;
    margin: 0px;
    height: 33px;
    width: 24px;
    text-align: center;
    line-height: 35px;
  }
  `,
  providers: [
    { provide: IbBreadcrumbComponent, useExisting: CustomBreadcrumb },
  ],
})
class CustomBreadcrumb extends IbBreadcrumbComponent {}

const meta: Meta<CustomBreadcrumb> = {
  title: "Components/Breadcrumbs",
  component: CustomBreadcrumb,
  tags: ["autodocs"],
  decorators: [
    moduleMetadata({
      imports: [
        IbBreadcrumbModule,
        CustomBreadcrumb,
        RouterTestingModule,
        StorybookTranslateModule,
      ],
    }),
    applicationConfig({
      providers: [provideAnimations()],
    }),
  ],
  parameters: {
    controls: {
      include: ["home", "items", "mode"],
    },
  },
};

export default meta;
type Story = StoryObj<CustomBreadcrumb>;

export const BuildYourOwn: Story = {
  args: {
    items: [
      {
        url: "#",
        label: "Feature",
      },
      {
        url: "#",
        label: "section",
      },
      {
        url: "#",
        label: "page",
      },
    ],
    mode: "static",
  },
};
