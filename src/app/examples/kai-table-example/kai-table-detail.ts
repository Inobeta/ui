import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-kai-table-detail',
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <div>
      Route param id: {{ id }}
    </div>
  `
})
export class KaiTableDetailComponent {
  id: string | null = null;

  constructor(private route: ActivatedRoute) {
    this.route.paramMap.subscribe(params => {
      this.id = params.get('id');
    });
  }
}