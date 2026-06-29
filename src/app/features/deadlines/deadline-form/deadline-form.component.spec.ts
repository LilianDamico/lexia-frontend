import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DeadlineFormComponent } from './deadline-form.component';

describe('DeadlineFormComponent', () => {
  let component: DeadlineFormComponent;
  let fixture: ComponentFixture<DeadlineFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeadlineFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DeadlineFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
