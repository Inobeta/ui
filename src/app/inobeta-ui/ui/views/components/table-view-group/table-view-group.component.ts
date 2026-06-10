import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  QueryList,
  ViewChildren,
  inject,
} from "@angular/core";
import { Store } from "@ngrx/store";
import { BehaviorSubject, Observable, Subject } from "rxjs";
import { takeUntil, tap } from "rxjs/operators";
import { IbKaiTableAction } from "../../../kai-table/action";
import { IbViewList } from "../view-list/view-list.component";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { MatTooltipModule } from "@angular/material/tooltip";
import { TranslateModule } from "@ngx-translate/core";
import { IbTableActionModule } from "../../../kai-table/action";
import { IbViewSnapshot } from "../../view.types";
import { IbTableUrlService } from "../../../kai-table/table-url.service";

@Component({
  selector: "ib-view-group, ib-table-view-group",
  templateUrl: "table-view-group.component.html",
  styleUrls: ["table-view-group.component.scss"],
  standalone: true,
  imports: [IbViewList, MatIconModule, MatButtonModule, MatTooltipModule, TranslateModule, IbTableActionModule]
})
export class IbTableViewGroup implements OnDestroy {
  @ViewChildren(IbKaiTableAction) actions: QueryList<IbKaiTableAction>;

  private _destroyed = new Subject<void>();
  tableUrl = inject(IbTableUrlService);

  get defaultView(): IbViewSnapshot {
    return {
      id: "__ibTableView__all",
      name: "",
      groupName: "",
      componentType: "table",
      data: {
        filter: this.tableUrl.emptyFilterSchema?.[this.viewGroupName],
        pageSize: 20,
        aggregatedColumns: {},
        sort: {
          active: "",
          direction: "",
        }
      },
    };
  }

  _activeView = new BehaviorSubject<IbViewSnapshot>({
    ...this.defaultView,
    initial: true
  });
  get activeView() {
    return {
      ...this._activeView.value,
      initial: false
    };
  }


  @Input() viewDataAccessor: () => any = () => structuredClone(this.defaultView.data);

  @Output() ibViewChanged = new EventEmitter<IbViewSnapshot>();
  @Output() ibResetView = new EventEmitter();

  @Input() set viewGroupName(name) {
    this._viewGroupName = name;
    // store selectors removed in refactor; provide empty observable for views
    this.views$ = this.store.select(() => [] as IbViewSnapshot[]).pipe(
      tap(() => {
        // noop
      })
    );
  }
  get viewGroupName() {
    return this._viewGroupName;
  }
  private _viewGroupName: string;

  dirty = false;
  views$: Observable<IbViewSnapshot[]>;

  constructor(private store: Store, public viewService: any) { }


  ngOnDestroy() {
    this._destroyed.next();
    this._destroyed.complete();
  }


  checkViewDataChanges(): boolean {
    const current = this.viewDataAccessor();
    if (current === undefined) {
      return false;
    }

    // FIXME: this check is really bad, we should use a deep comparison and schema initializer must be done in a better way
    try {
      if (JSON.stringify((this.activeView.data as any).filter) == '{}') {
        (this.activeView.data as any).filter = structuredClone(this.tableUrl.emptyFilterSchema?.[this.viewGroupName] ?? {});
      }
    } catch (e) {
      // silence - defensive for refactor paths where data shape may differ
    }


    return JSON.stringify(current) != JSON.stringify(this.activeView.data);
  }

  handleStateChanges(changes$: Observable<unknown>) {
    changes$
      .pipe(takeUntil(this._destroyed))
      .subscribe(() => (this.dirty = this.checkViewDataChanges()));
  }

  handleAddView(data = this.defaultView.data) {
    this.viewService.openAddViewDialog().subscribe(({ name }) => {
      const view = this.viewService.addView({
        name,
        groupName: this.viewGroupName,
        data,
      });
      this._activeView.next(view);
    });
  }

  handleRemoveView(view: IbViewSnapshot) {
    this.viewService.openDeleteViewDialog(view).subscribe(() => {
      this.viewService.deleteView(view);
      this._activeView.next(this.defaultView);
    });
  }

  handleRenameView(view: IbViewSnapshot) {
    this.viewService.openRenameViewDialog(view).subscribe(({ name }) => {
      this._activeView.next(this.viewService.renameView(view, name));
    });
  }

  handleDuplicateView(view: IbViewSnapshot) {
    this.viewService.openDuplicateViewDialog(view).subscribe(({ name }) => {
      const nextView = this.viewService.duplicateView({
        name,
        groupName: view.groupName,
        data: this.viewDataAccessor(),
      });
      this._activeView.next(nextView);
    });
  }

  handleSaveView() {
    if (this.activeView.id === this.defaultView.id) {
      this.handleAddView(this.viewDataAccessor());
      return;
    }

    const view = this.viewService.saveView(
      this.activeView,
      this.viewDataAccessor()
    );
    this._activeView.next(view);
  }

  handleChangeView(view: IbViewSnapshot) {
    if (!this.dirty) {
      this._activeView.next(view);
      return;
    }

    if (this.activeView.id === this.defaultView.id) {
      this.viewService.openSaveAsDialog().subscribe((newView) => {
        if (newView.confirmed) {
          this.viewService.addView({
            name: newView.name,
            groupName: this.viewGroupName,
            data: this.viewDataAccessor(),
          });
        }
        this._activeView.next(view);
      });
      return;
    }

    this.viewService
      .openSaveChangesDialog(this.activeView)
      .subscribe((result) => {
        if (result.confirmed) {
          this.viewService.saveView(this.activeView, this.viewDataAccessor());
        }
        this._activeView.next(view);
      });
  }

  handleDiscardChanges() {
    this._activeView.next(this.activeView);
  }
}
