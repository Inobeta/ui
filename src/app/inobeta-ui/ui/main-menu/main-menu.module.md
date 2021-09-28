# Main Menu Module

Module that generates the main menu (desktop version). 

## Introduction

This module can be used to easily create a navigation menu for an application, and can support an unlimited number of first level and second level menu sections.

## How it works

It consists of a component `<ib-main-menu-bar>` that should be put on the header of the application. This component renders a menu button that on click event triggers the rendering of the dialog component `<ib-main-menu-dialog>` and sends to it the data previously received as inputs, which are required to initialize the menu. The dialog component contains the component `<ib-main-menu-expanded>`, which is the actual menu template that the user will use to navigate through the application.

## Use Case Example

### Component
#### ib-main-menu-example.component.ts

```typescript 

...

@Component({
  selector: 'ib-main-menu-example',
  templateUrl: './ib-main-menu-example.component.html'
})

export class IbMainMenuExampleComponent  {

  // declare icon for <ib-main-menu-bar> button
  exampleMenuIconBar: string = 'apps';

  // declare data for first and second levels menu navigation
  exampleNavData: IbMainMenuData[] = navData;

  // declare string for app title you want to display in the menu
  exampleAppTitle: string = 'My App';
  
  // declare data for up right buttons  
  exampleNavUpRight: IbMainMenuButton[] = navUpRightData;

  // decalre data for bottom left button
  exampleNavBottomLeft: IbMainMenuButton = navBottomLeftData;
  
  // declare string you want to display on the bottom right of the menu (like copyright)
  exampleNavBottomRight: string = '© Acme 2021'
  
  constructor() { }
  
  ...

```

In your component, you just need to declare these variables in order to set up the required data. To know how to set the data correctly with some examples, please visit the interfaces section below.
After doing that, you need to declare the `<ib-main-menu-bar>` in the template and send to it these data as inputs.

### Template 
#### ib-main-menu-example.component.html

```html
<ib-main-menu-bar
      [barIcon]="exampleMenuIconBar"
      [navData]="exampleNavData"
      [navTitle]="exampleAppTitle"
      [navButtonsUpRight]="exampleNavUpRight"
      [navBottomLeft]="exampleNavBottomLeft"
      [navButtonBottomRight]="exampleNavBottomRight"
    ></ib-main-menu-bar>
```
That's it! Your menu is ready to be used for navigation.

## Interfaces

Here's the section about customized data models, whose rules must be followed in order to properly set the menu's required data.
Please note that the `icon` string field will display an actual icon only if it refers to the material icons list you can find [here](https://fonts.google.com/icons). 

### IbMainMenuButton

#### Interface

```typescript
export interface IbMainMenuButton {
  label: string,
  icon: string,
  link: string
}
```
#### Example
```typescript
{
      label: "Settings",
      icon: "settings",
      link: "home/settings"
    },
```
### IbMainMenuData

#### Interface
```typescript
export interface IbMainMenuData {
  label: string,
  icon: string,
  link: string,
  paths?: IbMainMenuData []
}
```

#### Example
```json
  {
    "label": "First level section 1",
    "icon": "science",
    "link": "/home/first-level-1",
    "paths": [
      {
        "label": "Second level section 1",
        "icon": "science",
        "link":  "/second-level-1"
      },
      {
         "label": "Second level section 2",
        "icon": "science",
        "link":  "/second-level-2"
      }
    ]
  },
  {
    "label": "First level section 2",
    "icon": "sports_soccer",
    "link": "/home/first-level-2",
    "paths": [
      {
         "label": "Second level section 1",
        "icon": "sports_soccer",
        "link":  "/second-level-1"
      }
    ]
  }
```
This data model is designed so you can set a first level menu section with second level menu sections connected to it, so when the menu is rendered, the `routeLink` referred to the second level will be the composition of its first level parent link plus its link. For example:
```json
{
    "label": "First level section 1",
    "icon": "science",
    "link": "/home/first-level-1",
    "paths": [
      {
        "label": "Second level section 1",
        "icon": "science",
        "link":  "/second-level-1"
      },
      ...
```
Here, the `routeLink` referred to 'Second level section 1' will become
`/home/first-level-1/second-level-1`.
