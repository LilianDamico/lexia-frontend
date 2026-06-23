import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toNullable } from '../../../shared/utils/form.utils';
import {
  CalculationPayload,
  CalculationsService,
  CalculationType,
} from '../calculations.service';

interface CalculationTypeOption {
  value: CalculationType;
  label: string;
}

const CALCULATION_TYPE_OPTIONS: CalculationTypeOption[] = [
  { value: 'simple_interest', label: 'Juros simples' },
  { value: 'compound_interest', label: 'Juros compostos' },
  { value: 'monetary_correction', label: 'Correção monetária' },
  { value: 'attorney_fees', label: 'Honorários advocatícios' },
  { value: 'fgts', label: 'FGTS' },
];

@Component({
  selector: 'lexia-calculation-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="ai-disclaimer">
      <span>⚠️</span>
      <span>⚠️ Esta informação foi gerada por IA e requer revisão humana.</span>
    </div>

    <section class="page">
      <header class="page-header">
        <div>
          <h2>{{ isEditMode() ? 'Editar cálculo' : 'Novo cálculo' }}</h2>
          <p>Informe os parâmetros do cálculo antes de registrar o resultado na operação.</p>
        </div>
        <a class="btn-secondary" routerLink="/calculations">Voltar</a>
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
                <input type="text" formControlName="title" placeholder="Ex.: Atualização de débito contratual" />
                @if (submitted() && form.controls.title.invalid) {
                  <span class="field-error">Informe o título do cálculo.</span>
                }
              </label>

              <label>
                Tipo de cálculo
                <select formControlName="calculation_type">
                  @for (option of calculationTypeOptions; track option.value) {
                    <option [value]="option.value">{{ option.label }}</option>
                  }
                </select>
              </label>

              <label>
                Valor principal
                <input type="number" min="0" step="0.01" formControlName="principal_amount" />
                @if (submitted() && form.controls.principal_amount.invalid) {
                  <span class="field-error">Informe um valor principal válido.</span>
                }
              </label>

              <label>
                Taxa anual de juros (%)
                <input type="number" min="0" step="0.01" formControlName="annual_interest_rate" />
                @if (submitted() && form.controls.annual_interest_rate.invalid) {
                  <span class="field-error">Informe uma taxa válida.</span>
                }
              </label>

              <label>
                Data inicial
                <input type="date" formControlName="start_date" />
                @if (submitted() && form.controls.start_date.invalid) {
                  <span class="field-error">Informe a data inicial.</span>
                }
              </label>

              <label>
                Data final
                <input type="date" formControlName="end_date" />
                @if (submitted() && form.controls.end_date.invalid) {
                  <span class="field-error">Informe a data final.</span>
                }
              </label>

              <label class="full-width">
                Observações
                <textarea formControlName="notes" placeholder="Base legal, premissas e ressalvas do cálculo"></textarea>
              </label>
            </div>

            <div class="actions">
              <button type="submit" class="btn-primary" [disabled]="saving()">
                {{ saving() ? 'Salvando...' : 'Salvar cálculo' }}
              </button>
              <a class="btn-secondary" routerLink="/calculations">Cancelar</a>
            </div>
          </form>
        }
      </article>
    </section>
  `,
})
export class CalculationFormComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly calculationsService = inject(CalculationsService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly calculationTypeOptions = CALCULATION_TYPE_OPTIONS;
  readonly isEditMode = signal(false);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly submitted = signal(false);
  readonly errorMessage = signal('');
  readonly form = this.formBuilder.nonNullable.group({
    title: ['', [Validators.required]],
    calculation_type: ['simple_interest' as CalculationType, [Validators.required]],
    principal_amount: [0, [Validators.required, Validators.min(0)]],
    annual_interest_rate: [0, [Validators.required, Validators.min(0)]],
    start_date: ['', [Validators.required]],
    end_date: ['', [Validators.required]],
    notes: [''],
  });

  private calculationId = '';

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    this.isEditMode.set(true);
    this.calculationId = id;
    this.loading.set(true);
    this.calculationsService.getById(id).subscribe({
      next: (calculation) => {
        this.form.patchValue({
          title: calculation.title,
          calculation_type: calculation.calculation_type,
          principal_amount: calculation.principal_amount,
          annual_interest_rate: calculation.annual_interest_rate,
          start_date: calculation.start_date.slice(0, 10),
          end_date: calculation.end_date.slice(0, 10),
          notes: calculation.notes ?? '',
        });
        this.loading.set(false);
      },
      error: (error: Error) => {
        this.loading.set(false);
        this.errorMessage.set(error.message);
      },
    });
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
    const payload: CalculationPayload = {
      case_id: null,
      title: values.title,
      calculation_type: values.calculation_type,
      principal_amount: values.principal_amount,
      annual_interest_rate: values.annual_interest_rate,
      start_date: values.start_date,
      end_date: values.end_date,
      notes: toNullable(values.notes),
    };

    const request = this.isEditMode()
      ? this.calculationsService.update(this.calculationId, payload)
      : this.calculationsService.create(payload);

    request.subscribe({
      next: () => {
        this.saving.set(false);
        void this.router.navigate(['/calculations']);
      },
      error: (error: Error) => {
        this.saving.set(false);
        this.errorMessage.set(error.message);
      },
    });
  }
}
