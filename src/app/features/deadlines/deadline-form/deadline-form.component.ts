import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LegalCase } from '../../../core/models/case.model';
import { DeadlineCreate, DeadlineUpdate } from '../../../core/models/deadline.model';
import { CaseService } from '../../../core/services/case.service';
import { DeadlineService } from '../../../core/services/deadline.service';

@Component({
  selector: 'lexia-deadline-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <section class="page">
      <header class="page-header">
        <div>
          <h2>{{ isEditMode() ? 'Editar prazo' : 'Novo prazo' }}</h2>
          <p>Associe o prazo a um caso e defina sua execução.</p>
        </div>
        <a class="btn-secondary" routerLink="/deadlines">Voltar</a>
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
                <input type="text" formControlName="title" placeholder="Ex.: Protocolo de contestação" />
                @if (submitted() && form.controls.title.invalid) {
                  <span class="field-error">Informe o título do prazo.</span>
                }
              </label>

              <label>
                Caso
                <select formControlName="case_id">
                  <option value="">Selecione</option>
                  @for (legalCase of cases(); track legalCase.id) {
                    <option [value]="legalCase.id">{{ legalCase.title }}</option>
                  }
                </select>
                @if (submitted() && form.controls.case_id.invalid) {
                  <span class="field-error">Selecione o caso.</span>
                }
              </label>

              <label>
                Data e hora
                <input type="datetime-local" formControlName="due_at" />
                @if (submitted() && form.controls.due_at.invalid) {
                  <span class="field-error">Informe a data e hora do prazo.</span>
                }
              </label>

              <label>
                Status
                <select formControlName="status">
                  <option value="pending">Pendente</option>
                  <option value="completed">Concluído</option>
                  <option value="expired">Vencido</option>
                  <option value="cancelled">Cancelado</option>
                </select>
              </label>

              <label class="full-width">
                Descrição
                <textarea formControlName="description" placeholder="Detalhes úteis para execução do prazo"></textarea>
              </label>
            </div>

            @if (isEditMode()) {
              <p class="form-hint">O caso permanece bloqueado na edição para manter aderência ao contrato atual da API.</p>
            }

            <div class="actions">
              <button type="submit" class="btn-primary" [disabled]="saving()">
                {{ saving() ? 'Salvando...' : 'Salvar prazo' }}
              </button>
              <a class="btn-secondary" routerLink="/deadlines">Cancelar</a>
            </div>
          </form>
        }
      </article>
    </section>
  `,
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
        description: this.optional(values.description),
        due_at: values.due_at,
        status: this.optional(values.status),
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
      description: this.optional(values.description),
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

  private optional(value: string): string | null {
    const trimmed = value.trim();
    return trimmed ? trimmed : null;
  }

  private toInputDateTime(value: string): string {
    return value ? value.slice(0, 16) : '';
  }
}
