import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CaseStatus, LegalArea, LegalCaseCreate, LegalCaseUpdate } from '../../../core/models/case.model';
import { Client } from '../../../core/models/client.model';
import { AuthService } from '../../../core/services/auth.service';
import { CaseService } from '../../../core/services/case.service';
import { ClientService } from '../../../core/services/client.service';
import { toNullable } from '../../../shared/utils/form.utils';

@Component({
  selector: 'lexia-case-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './case-form.component.html',
  styleUrl: './case-form.component.css'
})
export class CaseFormComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly caseService = inject(CaseService);
  private readonly clientService = inject(ClientService);
  private readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly statusOptions: CaseStatus[] = ['draft', 'active', 'suspended', 'closed', 'archived'];
  readonly clients = signal<Client[]>([]);
  readonly legalAreas = signal<LegalArea[]>([]);
  readonly isEditMode = signal(false);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly submitted = signal(false);
  readonly clientsError = signal('');
  readonly legalAreasError = signal('');
  readonly errorMessage = signal('');
  readonly form = this.formBuilder.nonNullable.group({
    title: ['', [Validators.required]],
    client_id: ['', [Validators.required]],
    legal_area_id: ['', [Validators.required]],
    description: [''],
    status: ['active' as CaseStatus, [Validators.required]],
    case_number: [''],
    court: [''],
    facts_summary: [''],
    strategy_notes: [''],
  });

  private caseId = '';

  ngOnInit(): void {
    this.loadClients();
    this.loadLegalAreas();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.caseId = id;
      this.loadCase(id);
      return;
    }

    this.loading.set(false);
  }

  save(): void {
    this.submitted.set(true);
    this.errorMessage.set('');

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const values = this.form.getRawValue();

    if (this.isEditMode()) {
      this.saving.set(true);
      const payload: LegalCaseUpdate = {
        title: values.title,
        description: toNullable(values.description),
        status: values.status,
        case_number: toNullable(values.case_number),
        court: toNullable(values.court),
        facts_summary: toNullable(values.facts_summary),
        strategy_notes: toNullable(values.strategy_notes),
      };

      this.caseService.update(this.caseId, payload).subscribe({
        next: () => {
          this.saving.set(false);
          void this.router.navigate(['/cases']);
        },
        error: (error: Error) => {
          this.saving.set(false);
          this.errorMessage.set(error.message);
        },
      });
      return;
    }

    const payload: LegalCaseCreate = {
      law_office_id: this.authService.lawOfficeId(),
      client_id: values.client_id,
      legal_area_id: values.legal_area_id,
      title: values.title,
      description: toNullable(values.description),
      status: values.status,
      case_number: toNullable(values.case_number),
      court: toNullable(values.court),
      facts_summary: toNullable(values.facts_summary),
      strategy_notes: toNullable(values.strategy_notes),
    };

    if (!payload.law_office_id) {
      this.errorMessage.set('Sessão inválida. Faça login novamente.');
      return;
    }

    this.saving.set(true);
    this.caseService.create(payload).subscribe({
      next: () => {
        this.saving.set(false);
        void this.router.navigate(['/cases']);
      },
      error: (error: Error) => {
        this.saving.set(false);
        this.errorMessage.set(error.message);
      },
    });
  }

  private loadClients(): void {
    this.clientService.list().subscribe({
      next: (clients) => this.clients.set(clients),
      error: (error: Error) => this.clientsError.set(error.message),
    });
  }

  private loadLegalAreas(): void {
    this.caseService.getLegalAreas().subscribe({
      next: (areas) => this.legalAreas.set(areas),
      error: (error: Error) => this.legalAreasError.set(error.message),
    });
  }

  private loadCase(id: string): void {
    this.caseService.getById(id).subscribe({
      next: (legalCase) => {
        this.form.patchValue({
          title: legalCase.title,
          client_id: legalCase.client_id,
          legal_area_id: legalCase.legal_area_id,
          description: legalCase.description ?? '',
          status: legalCase.status,
          case_number: legalCase.case_number ?? '',
          court: legalCase.court ?? '',
          facts_summary: legalCase.facts_summary ?? '',
          strategy_notes: legalCase.strategy_notes ?? '',
        });
        this.form.controls.client_id.disable();
        this.form.controls.legal_area_id.disable();
        this.loading.set(false);
      },
      error: (error: Error) => {
        this.loading.set(false);
        this.errorMessage.set(error.message);
      },
    });
  }
}