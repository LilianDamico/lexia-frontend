import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PetitionFormComponent } from './petition-form.component';

describe('PetitionFormComponent', () => {
  let component: PetitionFormComponent;
  let fixture: ComponentFixture<PetitionFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PetitionFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PetitionFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
