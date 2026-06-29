import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LegalCase } from '../../../core/models/case.model';
import { DeadlineCreate, DeadlineUpdate } from '../../../core/models/deadline.model';
import { CaseService } from '../../../core/services/case.service';
import { DeadlineService } from '../../../core/services/deadline.service';
import { toNullable } from '../../../shared/utils/form.utils';

@Component({
  selector: 'lexia-deadline-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './deadline-form.component.html',
  styleUrl: './deadline-form.component.css'
})
export class DeadlineFormComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly deadlineService = inject(DeadlineService);
  private readonly caseService = inject(CaseService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly cases = signal<LegalCase[]>([]);
  readonly isEditMode = signal(false);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly submitted = signal(false);
  readonly errorMessage = signal('');
  readonly form = this.formBuilder.nonNullable.group({
    title: ['', [Validators.required]],
    case_id: ['', [Validators.required]],
    description: [''],
    due_at: ['', [Validators.required]],
    status: ['pending', [Validators.required]],
  });

  private deadlineId = '';

  ngOnInit(): void {
    this.loadCases();
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.loading.set(false);
      return;
    }

    this.isEditMode.set(true);
    this.deadlineId = id;
    this.loadDeadline(id);
  }

  save(): void {
    this.submitted.set(true);
    this.errorMessage.set('');

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    const values = this.form.getRawValue();

    if (this.isEditMode()) {
      const payload: DeadlineUpdate = {
        title: values.title,
        description: toNullable(values.description),
        due_at: values.due_at,
        status: toNullable(values.status),
      };

      this.deadlineService.update(this.deadlineId, payload).subscribe({
        next: () => {
          this.saving.set(false);
          void this.router.navigate(['/deadlines']);
        },
        error: (error: Error) => {
          this.saving.set(false);
          this.errorMessage.set(error.message);
        },
      });
      return;
    }

    const payload: DeadlineCreate = {
      case_id: values.case_id,
      title: values.title,
      description: toNullable(values.description),
      due_at: values.due_at,
      status: values.status,
    };

    this.deadlineService.create(payload).subscribe({
      next: () => {
        this.saving.set(false);
        void this.router.navigate(['/deadlines']);
      },
      error: (error: Error) => {
        this.saving.set(false);
        this.errorMessage.set(error.message);
      },
    });
  }

  private loadCases(): void {
    this.caseService.list().subscribe({
      next: (cases) => this.cases.set(cases),
      error: (error: Error) => this.errorMessage.set(error.message),
    });
  }

  private loadDeadline(id: string): void {
    this.deadlineService.getById(id).subscribe({
      next: (deadline) => {
        this.form.patchValue({
          title: deadline.title,
          case_id: deadline.case_id,
          description: deadline.description ?? '',
          due_at: this.toInputDateTime(deadline.due_at),
          status: deadline.status,
        });
        this.form.controls.case_id.disable();
        this.loading.set(false);
      },
      error: (error: Error) => {
        this.loading.set(false);
        this.errorMessage.set(error.message);
      },
    });
  }

  private toInputDateTime(value: string): string {
    return value ? value.slice(0, 16) : '';
  }
}
