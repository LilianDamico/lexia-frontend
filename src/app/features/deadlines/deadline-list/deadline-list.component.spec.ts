import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DeadlineListComponent } from './deadline-list.component';

describe('DeadlineListComponent', () => {
  let component: DeadlineListComponent;
  let fixture: ComponentFixture<DeadlineListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeadlineListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DeadlineListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
