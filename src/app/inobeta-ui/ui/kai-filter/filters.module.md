<h1>IbFilter</h1>

# Build your own filter

```typescript
// boolean-filter.components.ts
@Component({
  selector: "ib-boolean-filter",
  templateUrl: "boolean-filter.component.html",
  // Provide this class with an `IbFilterBase` token so that can be read by `IbFilter`
  providers: [{ provide: IbFilterBase, useExisting: IbBooleanFilter }],
})
export class IbBooleanFilter extends IbFilterBase {
  searchCriteria = new FormControl(null, { nonNullable: true });

  get displayValue() {
    return this.rawValue;
  }

  build(): IbFilterDef {
    return none();
  }
}
```

```html
<!-- boolean-filter.component.html -->
<ib-filter-button>
  <span ib-filter-name><ng-content></ng-content></span>
  <span ib-filter-value *ngIf="isDirty">
    {{ displayValue ? "True" : "False" }}
  </span>

  <section [formGroup]="filter.form" style="padding: 0.5em 1em 0 1em">
    <mat-radio-group [formControlName]="name">
      <mat-radio-button [value]="true">True</mat-radio-button>
      <mat-radio-button [value]="false">False</mat-radio-button>
    </mat-radio-group>
  </section>

  <ib-filter-actions>
    <button ib-clear-filter-button mat-button (click)="clear()" [disabled]="!isDirty">
      {{ "shared.ibFilter.clear" | translate }}
    </button>
    <button ib-apply-filter-button mat-button color="primary" (click)="applyFilter()">
      {{ "shared.ibFilter.update" | translate }}
    </button>
  </ib-filter-actions>
</ib-filter-button>
```

||Info
|-|-|
`ib-filter-button`|Out-of-the-box component to implement your filter with styles aligned with the filters provided by the library.  The implicit content will be assigned as the template for the `mat-menu` overlay.
`ib-filter-name`|Slot for the filter name.
`ib-filter-value`|Slot for the filter's value applied by the user.
`isDirty`|Getter that returns a boolean. It should lookup either the raw or compiled filter value, not `searchCriteria`.
|
`[formGroup]="filter.form"`|Parent form exposed by `IbFilter`
`[formControlName]="name"`|Name of the `searchCriteria` form group or control. It should match the name of the filter. In this example, a `FormControl` was used.
|
`ib-filter-actions`|Footer for the clear and apply buttons.
