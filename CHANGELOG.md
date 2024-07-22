# Inobeta/UI Changelog

## [18.0.0] (unreleased)

| Issue ID | Type | Section | Description |
| -- | -- | -- | -- |
|DEVK-363|BREAKING CHANGE|IbTable|Removed `<ib-table>`|
|DEVK-363|BREAKING CHANGE|IbHttpModule|Removed deprecations|
|DEVK-363|BREAKING CHANGE|theming|Removed `ui.theme()` mixin|
|DEVK-363|feat|theming|Removed `all-component-colors` mixin call from the library|
|DEVK-363|feat|theming|Added 2 theme mixin for `main-menu` and `toast`|

## [17.1.1] (2024-07-19)

| Issue ID | Type | Section | Description |
| -- | -- | -- | -- |
|DEVK-331|fix|ibHttpModule|Default value of injection token refactoring|
|DEVK-332|feat|IbMaterialFormModule|Added `disabled` input|
|DEVK-333|fix|IbFilterModule|Fix errors when filter referencies on non existing column|
|DEVK-336|refactor|ibHttpModule|ibLoginService.login was not a pure function|
|DEVK-337|fix|IbDynamicForm|Patch form value on field definition change|
|DEVK-338|feat|Docs|Added workaround instructions for tailwind overriding base styles|
|DEVK-339|fix|IbFilterModule|Some types was not exported|
|DEVK-340|docs|IbFilterModule|Custom filter explained & Added `ib-boolean-filter`|
|DEVK-341|fix|IbFilterModule|Empty value added on filter tag|
|DEVK-343|docs|IbViewModule|Missing doc added|
|DEVK-344|fix|IbFilterModule|ISO8601 Date support|
|DEVK-345|fix|IbViewModule|Massive refactoring & url qs addes|
|DEVK-346|feat|IbKaiTableModule|Add state management from querystring|
|DEVK-353|fix|IbMaterialFormModule|Input focus was not working inside a form array|
|DEVK-354|fix|IbMaterialFormModule|Missing hook added on form array|

## [17.1.0] (2024-03-01)

| Issue ID | Type | Section | Description |
| -- | -- | -- | -- |
|DEVK-261|feat|IbDynamicForm|Added `value` input to `ib-material-form`|
|DEVK-264|docs|Docs|Changed compodoc for storybook|
|DEVK-297|docs|Docs|Docs feedbacks|
|DEVK-288|feat|IbTable|Added `sortingDataAccessor` and `filterDataAccessor` to `IbColumn`|
|DEVK-189|feat|IbTable|Add `IbTableRemoteDataSource` and `IbTableDataProvider` for server-side interactions|
|DEVK-189|feat|IbFilter|Add `ibQueryUpdated`; provides a serialized filter for HTTP queries|
|DEVK-309|feat|IbTable|Add `stripedRows` to `ib-kai-table`|

### [17.1.0] - breaks

- Upgraded `rxjs` to version `7.8.0`, please follow the [deprecations & breaking changes](https://rxjs.dev/deprecations/breaking-changes) instructions
to up your application accordingly
- The following CSS classes have been renamed:
  - `.ib-table-scrollable` -> `.ib-table__content`
  - `.ib-table-group-detail-row` -> `.ib-table__row-group`
  - `.ib-table-element-row` -> `.ib-table__row`
  - `.ib-table-element-detail` -> `.ib-table__cell-detail`
  - `.ib-filter__hide` -> `.ib-filter--hidden`

## [17.0.1] (2024-01-10)

| Issue ID | Type | Section | Description |
| -- | -- | -- | -- |
|DEVK-246|fix|IbDataExport|fix jspdf autotable webpack bundle error|
|DEVK-248|feat|IbDataExport|Added directive ibDataTransformer|
|DEVK-249|fix|IbHttp|Removed forced Content-Type header|
|DEVK-250|feat|All|Copy scss theme assets using ng-packagr|
|DEVK-251|fix|IbTable|Ux improvements on ib tag filter|
|DEVK-253|fix|IbTable|Use copy of displayed columns array to avoid side-effects|

## [17.0.0] (2023-12-29)

| Issue ID | Type | Section | Description |
| -- | -- | -- | -- |
|DEVK-204|feat|All|Added support for Angular 17|

### [17.0.0] - breaks

- Node versions <= 20.9.0 are unsupported from this version, please install **v20.10.0** for a better support
- themes inclusion changes, please replace import and usage instructions with `@use '@inobeta-ui/ui';` and `@include ui.theme($app-theme);` in your scss. See README instructions for more info.

## [16.0.0] (2023-12-20)

| Issue ID | Type | Section | Description |
| -- | -- | -- | -- |
|DEVK-204|feat|All|Added support for Angular 16|

## [15.2.0] (2023-12-20)

| Issue ID | Type | Section | Description |
| -- | -- | -- | -- |
|DEVK-223|feat|IbForm|Added support for FormArray|
|DEVK-9|feat|IbHttp|Added directive and guard for role check|
|DEVK-228|ci|Examples build|Fix examples build |

## [15.1.0] (2023-11-30)

| Issue ID | Type | Section | Description |
| -- | -- | -- | -- |
|DEVK-181|fix|Package|Updated `package.json`; Moved `dependencies` in `peerDependencies`|
|DEVK-183|feat|IbTable|Created a new table that will replace old IbTableModule|
|DEVK-184|feat|IbFilter|Created filters for the new IbTable|
|DEVK-186|feat|IbView|Added IbViewModule; Added support for IbViewGroup in IbTable|
|DEVK-189|feat|IbTable|Created IbDataSource for server side interaction|
|DEVK-192|fix|IbTable|Removed `selectableRows` input. Added `ib-selection-column`|
|STOR-98|feat|IbHydration|**Breaking change** on hydration metareducer provided. Please use ibSetupHydration with full support on lazy loaded modules|
|DEVK-206|feat|IbHttpModule|Cleanup, deprecations, loader improvements|
|DEVK-154|feat|IbTranslate|Translation refactoring with `IbTranslateModuleLoader`|

## [15.1.0] - deprecations

- All features from `IbTableModule` are now deprecated, move to `IbKaiTableModule` ASAP
- `IbResponseHandlerService` is now deprecated, Use Angular standard interceptors to deal with response and errors
- `IbHttpClientService` is now deprecated, Use Angular standard HttpClientService with provided interceptors
- Redux actions `login`, `logout` are now deprecated, use `ibAuthActions` instead
- Redux action `changeNameSurname` is now deprecated and it will be removed
- `IbSessionService` is now deprecated, Use `IbLoginService<T>` instead
- `IbSession.userData` is now deprecated, Use `IbSession.serverData` with generics support instead
- `IbAuthService` is now deprecated, Use `ibSelectActiveSession<T>()` selector from store in order to get active session

## [15.0.0] (2023-01-11)

| Issue ID | Type | Section | Description |
| -- | -- | -- | -- |
|DEVK-155|feat|Angular Core|Angular code and deps upgraded to 15|
|DEVK-169|fix|IbMaterialFormModule|Support of maxLength validator on template fix|

### [15.0.0] - breaks

- ngrx-store-localstorage support end, please remove any usage and replace it with hydration metareducer provided. **no support on lazy loaded modules**: please install 15.1.x if you need it.
- @angular/flex-layout support end, please replace any usage with @Inobeta/flex-layout provided by @Inobeta/flex-layout@15.0.0-inobeta and move away from this lib ASAP
- @angular/material deprecates old styled component so take care of this, this version is now supporting new styled components

## [12.1.3] (2023-01-10)

| Issue ID | Type | Section | Description |
| -- | -- | -- | -- |
|DEVK-169|fix|IbMaterialFormModule|Support of maxLength validator on template fix|

## [14.0.0] (2022-12-27)

- Compatibility with angular 14

## [13.0.0] (2022-12-27)

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

## Changelog types

- ci: Changes to our CI configuration files and scripts
- docs: Documentation only changes
- feat: A new feature
- fix: A bug fix
- perf: A code change that improves performance
- refactor: A code change that neither fixes a bug nor adds a feature
- style: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
