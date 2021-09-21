import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IbMainMenuComponent } from './main-menu.component';

describe('IbMainMenuComponent', () => {
  let component: IbMainMenuComponent;
  let fixture: ComponentFixture<IbMainMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IbMainMenuComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IbMainMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
