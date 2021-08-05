import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IbTableTotalRowComponent } from './table-total-row.component';

describe('IbTableTotalRowComponent', () => {
  let component: IbTableTotalRowComponent;
  let fixture: ComponentFixture<IbTableTotalRowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IbTableTotalRowComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IbTableTotalRowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
