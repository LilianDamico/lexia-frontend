import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
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
  template: `
    <section class="page">
      <header class="page-header">
        <div>
          <h2>{{ isEditMode() ? 'Editar caso' : 'Novo caso' }}</h2>
          <p>Conecte cliente, área jurídica e estratégia processual.</p>
        </div>
        <a class="btn-secondary" routerLink="/cases">Voltar</a>
      </header>

      @if (errorMessage()) {
        <p class="alert alert-error">{{ errorMessage() }}</p>
      }

      <article class="card">
        @if (loading()) {
          <p>Carregando formulário...</p>
        } @else {
          <form class="form-stack" [formGroup]="form" (ngSubmit)="save()" novalidate>
            <div class="form-grid">
              <label>
                Título
                <input type="text" formControlName="title" placeholder="Ex.: Ação revisional de contrato" />
                @if (submitted() && form.controls.title.invalid) {
                  <span class="field-error">Informe o título do caso.</span>
                }
              </label>

              <label>
                Cliente
                <select formControlName="client_id">
                  <option value="">Selecione</option>
                  @for (client of clients(); track client.id) {
                    <option [value]="client.id">{{ client.name }}</option>
                  }
                </select>
                @if (submitted() && form.controls.client_id.invalid) {
                  <span class="field-error">Selecione o cliente.</span>
                }
              </label>

              <label>
                Área jurídica
                <select formControlName="legal_area_id">
                  <option value="">Selecione</option>
                  @for (legalArea of legalAreas(); track legalArea.id) {
                    <option [value]="legalArea.id">{{ legalArea.name }}</option>
                  }
                </select>
                @if (submitted() && form.controls.legal_area_id.invalid) {
                  <span class="field-error">Selecione a área jurídica.</span>
                }
              </label>

              <label>
                Status
                <select formControlName="status">
                  @for (status of statusOptions; track status) {
                    <option [value]="status">{{ status }}</option>
                  }
                </select>
              </label>

              <label>
                Número do processo
                <input type="text" formControlName="case_number" placeholder="0000000-00.0000.0.00.0000" />
              </label>

              <label>
                Tribunal
                <input type="text" formControlName="court" placeholder="TJSP, TRT, STJ..." />
              </label>

              <label class="full-width">
                Descrição
                <textarea formControlName="description" placeholder="Resumo objetivo do caso"></textarea>
              </label>

              <label class="full-width">
                Resumo dos fatos
                <textarea formControlName="facts_summary" placeholder="Fatos centrais e pontos sensíveis"></textarea>
              </label>

              <label class="full-width">
                Notas estratégicas
                <textarea formControlName="strategy_notes" placeholder="Linhas de atuação, riscos e próximos passos"></textarea>
              </label>
            </div>

            @if (isEditMode()) {
              <p class="form-hint">Cliente e área jurídica ficam bloqueados após a criação para respeitar o contrato atual da API.</p>
            }

            <div class="actions">
              <button type="submit" class="btn-primary" [disabled]="saving()">
                {{ saving() ? 'Salvando...' : 'Salvar caso' }}
              </button>
              <a class="btn-secondary" routerLink="/cases">Cancelar</a>
            </div>
          </form>
        }
      </article>
    </section>
  `,
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
    this.loadSupportData();
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

    this.saving.set(true);
    const values = this.form.getRawValue();

    if (this.isEditMode()) {
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

  private loadSupportData(): void {
    forkJoin({
      clients: this.clientService.list(),
      legalAreas: this.caseService.getLegalAreas(),
    }).subscribe({
      next: ({ clients, legalAreas }) => {
        this.clients.set(clients);
        this.legalAreas.set(legalAreas);
      },
      error: (error: Error) => this.errorMessage.set(error.message),
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