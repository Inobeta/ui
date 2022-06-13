# Inobeta/UI Changelog

## [13.0.0] (unreleased)

### [13.0.0] - changes

| Issue ID | Type | Section | Description |
| -- | -- | -- | -- |
|CASM-7|feat|Angular Core|Angular code and deps upgraded to 13.3|
|CASM-13|fix|IbHttpModule|Set providedIn root for all services, in order to avoid "non sigleton" side effects in lazy loaded modules|
|none|docs|Changelog|New format changelog|

### [13.0.0] - breaks

- Node versions <= 12.20.0 are unsupported from this version, please install v16.14.0 for a better support
- Angular Core version must be 13.3.9
- IbHttpModule must be imported in app.module.ts via forRoot method


## Changelog types

- ci: Changes to our CI configuration files and scripts
- docs: Documentation only changes
- feat: A new feature
- fix: A bug fix
- perf: A code change that improves performance
- refactor: A code change that neither fixes a bug nor adds a feature
- style: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)

## [12.1.2] (2022-05-23)

- Fix missing method stub on forms testing stuff

## [12.1.1]

- DEVK-149 IbMainMenu doc reviewed
- INOM-303 during bootstrap package removal from inomanager, a "class='hidden'" was found in the ib-uploader component, so it has been replaced with "style='display: none;'"

## [12.1.0]

- DEVK-130 fix color bug on custom table columns
- DEVK-131 IbHttpModule: added responseType & data to the http methods signature. Deprecated mobile version. http-204 format response handle
- DEVK-132 removed color warn on dialog button
- DEVK-86 IbTable Aggregation function added on NUMBER column
- DEVK-86 IbTable Sticky header/footer/column added
- DEVK-141 compodoc build fixed
- DEVK-126 IbTable filters, sort and aggregation save config added
- DEVK-153 IbDynamicForm: subscription on "form ready" added, disabledOnInit input will be removed in next major
- DEVK-149 IbMainMenu module added

## [12.0.1]

- DEVK-108 Fixed issue on date filter when using datetime data
- DEVK-84 Removed deprecated errors field from IbFormControlBase
- Fixed pipeline issue detected on job <https://gitlab.com/Inobeta/Interni/DevKit/inobeta-ui/-/jobs/1351671095>
- DEVK-127 showTotalSum option added to IbTableTitles
- DEVK-128 fixed bug on change trigger for IbMatDropdownControl when multiple: true
- Fixed overflow on table width for small devices or large tables

## [12.0.0]

- Compatibility with angular 12

## [11.0.0]

- Compatibility with angular 11
- Added deprecation flag on some dirty and old stuff

## [10.0.0]

- Compatibility with angular 10

## [9.0.0]

- Compatibility with angular 9

## [1.1.7]

- IbHttpModule: ibHttpToastErrorCode for custom error code translations
- IbMatDropdownControl: added hintMessage option
- IbMatDatepickerControl: fix locale bug on blur input
- IbMatDatepickerControl: fix bug on require validation
- IbMaterialFormComponent: added actionsPosition option & relative enum
- IbDynamicFormComponent: added disabledOnInit option default to false
- IbTableComponent: added iconSet option in order to override defaults mat icon
- IbTableComponent: added actionsPosition option & relative enum
- IbMatButtonControl: added requireConfirmOnDirty option for confirmation modal on dirty forms

## [1.1.6]

- fix production build on wrong toast import
- IbDynamicForms: debounceOnChange default to 0
- IbHttpModule: added ibHttpUrlExcludedFromLoader spinner loading url exclusions
- IbMatTextboxComponent get min/max DOM validation from angular validators
- IbMatSlideToggleComponent added
- auth interceptor now force logout on 401 errors

## [1.1.5]

- numbers type added to IbMatDropdownControl
- nullLabel option added to IbMatDropdownControl
- date explicit parsing added to IbMatDatepickerControl
- removed deps from moment and angular/material-moment-adapter
- auth & error interceptors added

## [1.1.4]

- fix production build issue caused by moment 2.29 version

## [1.1.3]

- Translations added on ibTable paginator
- reloadLang added on translate service stub
- forms datepicker translated
- breadcrumbs minor fixes & nested routes test
- textbox hint option added
- IbCrudToast: bug fix on return data, and null support for messages (null will disable toast)

## [1.1.2]

- Fix checkbox align on material forms
- Added a decorator for message handling on CRUD components

## [1.1.1]

- Fix build prod errors caused by wrong modal module import in table module

## [1.1.0]

## Base version

### Stable

- IbTable
- IbDynamicForm & IbMatForm
- IbModal
- IbToast
- IbHttp
- Test Tools

### Unstable

- IbBreadcrumbs
- IbUploader
- Themes & CSS
