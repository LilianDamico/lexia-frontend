import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LegalCase } from '../../../core/models/case.model';
import { PetitionCreate, PetitionUpdate } from '../../../core/models/petition.model';
import { CaseService } from '../../../core/services/case.service';
import { PetitionService } from '../../../core/services/petition.service';
import { toNullable } from '../../../shared/utils/form.utils';

@Component({
  selector: 'lexia-petition-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <section class="page">
      <header class="page-header">
        <div>
          <h2>{{ isEditMode() ? 'Editar petição' : 'Nova petição' }}</h2>
          <p>Registre a peça, seu conteúdo e o caso relacionado.</p>
        </div>
        <a class="btn-secondary" routerLink="/petitions">Voltar</a>
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
                <input type="text" formControlName="title" placeholder="Ex.: Contestação trabalhista" />
                @if (submitted() && form.controls.title.invalid) {
                  <span class="field-error">Informe o título da petição.</span>
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
                Tipo da petição
                <input type="text" formControlName="petition_type" placeholder="Inicial, réplica, recurso..." />
              </label>

              <label class="full-width">
                Conteúdo
                <textarea formControlName="content" placeholder="Desenvolva ou cole o texto da petição"></textarea>
                @if (submitted() && form.controls.content.invalid) {
                  <span class="field-error">Informe o conteúdo da petição.</span>
                }
              </label>
            </div>

            @if (isEditMode()) {
              <p class="form-hint">O caso associado fica bloqueado na edição para seguir o contrato atual da API.</p>
            }

            <div class="actions">
              <button type="submit" class="btn-primary" [disabled]="saving()">
                {{ saving() ? 'Salvando...' : 'Salvar petição' }}
              </button>
              <a class="btn-secondary" routerLink="/petitions">Cancelar</a>
            </div>
          </form>
        }
      </article>
    </section>
  `,
})
export class PetitionFormComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly petitionService = inject(PetitionService);
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
    petition_type: [''],
    content: ['', [Validators.required]],
  });

  private petitionId = '';

  ngOnInit(): void {
    this.loadCases();
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.loading.set(false);
      return;
    }

    this.isEditMode.set(true);
    this.petitionId = id;
    this.loadPetition(id);
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
      const payload: PetitionUpdate = {
        title: values.title,
        petition_type: toNullable(values.petition_type),
        content: values.content,
      };

      this.petitionService.update(this.petitionId, payload).subscribe({
        next: () => {
          this.saving.set(false);
          void this.router.navigate(['/petitions']);
        },
        error: (error: Error) => {
          this.saving.set(false);
          this.errorMessage.set(error.message);
        },
      });
      return;
    }

    const payload: PetitionCreate = {
      case_id: values.case_id,
      title: values.title,
      petition_type: toNullable(values.petition_type),
      content: values.content,
    };

    this.petitionService.create(payload).subscribe({
      next: () => {
        this.saving.set(false);
        void this.router.navigate(['/petitions']);
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

  private loadPetition(id: string): void {
    this.petitionService.getById(id).subscribe({
      next: (petition) => {
        this.form.patchValue({
          title: petition.title,
          case_id: petition.case_id,
          petition_type: petition.petition_type ?? '',
          content: petition.content,
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
    return toNullable(value);
  }
}
