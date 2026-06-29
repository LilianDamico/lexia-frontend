import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LegalCase } from '../../../core/models/case.model';
import { HearingCreate, HearingUpdate } from '../../../core/models/hearing.model';
import { CaseService } from '../../../core/services/case.service';
import { HearingService } from '../../../core/services/hearing.service';

@Component({
  selector: 'lexia-hearing-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './hearing-form.component.html',
  styleUrl: './hearing-form.component.css'
})
export class HearingFormComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly hearingService = inject(HearingService);
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
    hearing_type: [''],
    scheduled_at: ['', [Validators.required]],
    location: [''],
    status: ['scheduled', [Validators.required]],
    notes: [''],
  });

  private hearingId = '';

  ngOnInit(): void {
    this.loadCases();
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.loading.set(false);
      return;
    }

    this.isEditMode.set(true);
    this.hearingId = id;
    this.loadHearing(id);
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
      const payload: HearingUpdate = {
        title: values.title,
        hearing_type: this.optional(values.hearing_type),
        scheduled_at: values.scheduled_at,
        location: this.optional(values.location),
        status: this.optional(values.status),
        notes: this.optional(values.notes),
      };

      this.hearingService.update(this.hearingId, payload).subscribe({
        next: () => {
          this.saving.set(false);
          void this.router.navigate(['/hearings']);
        },
        error: (error: Error) => {
          this.saving.set(false);
          this.errorMessage.set(error.message);
        },
      });
      return;
    }

    const payload: HearingCreate = {
      case_id: values.case_id,
      title: values.title,
      hearing_type: this.optional(values.hearing_type),
      scheduled_at: values.scheduled_at,
      location: this.optional(values.location),
      status: values.status,
      notes: this.optional(values.notes),
    };

    this.hearingService.create(payload).subscribe({
      next: () => {
        this.saving.set(false);
        void this.router.navigate(['/hearings']);
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

  private loadHearing(id: string): void {
    this.hearingService.getById(id).subscribe({
      next: (hearing) => {
        this.form.patchValue({
          title: hearing.title,
          case_id: hearing.case_id,
          hearing_type: hearing.hearing_type ?? '',
          scheduled_at: this.toInputDateTime(hearing.scheduled_at),
          location: hearing.location ?? '',
          status: hearing.status,
          notes: hearing.notes ?? '',
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

  private optional(value: string): string | null {
    const trimmed = value.trim();
    return trimmed ? trimmed : null;
  }

  private toInputDateTime(value: string): string {
    return value ? value.slice(0, 16) : '';
  }
}
