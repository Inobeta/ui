# Inobeta/UI Changelog

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
