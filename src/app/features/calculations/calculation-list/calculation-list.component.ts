import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Calculation, CalculationsService, CalculationType } from '../calculations.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { LexIADatePipe } from '../../../shared/pipes/lexia-date.pipe';

const TYPE_LABELS: Record<CalculationType, string> = {
  simple_interest: 'Juros simples',
  compound_interest: 'Juros compostos',
  monetary_correction: 'Correção monetária',
  attorney_fees: 'Honorários',
  fgts: 'FGTS',
};

@Component({
  selector: 'lexia-calculation-list',
  standalone: true,
  imports: [RouterLink, LexIADatePipe, ConfirmDialogComponent],
  template: `
    <div class="ai-disclaimer">
      <span>⚠️</span>
      <span>⚠️ Esta informação foi gerada por IA e requer revisão humana.</span>
    </div>

    <section class="page">
      <header class="page-header">
        <div>
          <h2>Cálculos jurídicos</h2>
          <p>Centralize cálculos financeiros vinculados à operação jurídica do escritório.</p>
        </div>
        <div class="actions">
          <button type="button" class="btn-secondary" (click)="loadCalculations()" [disabled]="loading()">Atualizar</button>
          <a class="btn-primary" routerLink="/calculations/new">Novo cálculo</a>
        </div>
      </header>

      @if (errorMessage()) {
        <p class="alert alert-error">{{ errorMessage() }}</p>
      }

      <article class="card">
        @if (loading()) {
          <p>Carregando cálculos...</p>
        } @else if (!calculations().length) {
          <div class="empty-state">
            <h3>Nenhum cálculo cadastrado</h3>
            <p>Crie um cálculo para consolidar valores atualizados do caso.</p>
          </div>
        } @else {
          <div class="table-wrapper">
            <table class="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Escritório</th>
                  <th>Caso</th>
                  <th>Título</th>
                  <th>Tipo</th>
                  <th>Principal</th>
                  <th>Juros a.a.</th>
                  <th>Início</th>
                  <th>Fim</th>
                  <th>Resultado</th>
                  <th>Observações</th>
                  <th>Criado em</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                @for (calculation of calculations(); track calculation.id) {
                  <tr>
                    <td>{{ calculation.id }}</td>
                    <td>{{ calculation.law_office_id }}</td>
                    <td>{{ calculation.case_id || '—' }}</td>
                    <td>{{ calculation.title }}</td>
                    <td>{{ typeLabel(calculation.calculation_type) }}</td>
                    <td>{{ formatCurrency(calculation.principal_amount) }}</td>
                    <td>{{ calculation.annual_interest_rate }}%</td>
                    <td>{{ calculation.start_date | lexiaDate:'dd/MM/yyyy' }}</td>
                    <td>{{ calculation.end_date | lexiaDate:'dd/MM/yyyy' }}</td>
                    <td>{{ formatCurrency(calculation.result_amount) }}</td>
                    <td>{{ calculation.notes || '—' }}</td>
                    <td>{{ calculation.created_at | lexiaDate }}</td>
                    <td>
                      <span class="status-badge {{ calculation.is_active ? 'active' : 'inactive' }}">
                        {{ calculation.is_active ? 'Ativo' : 'Inativo' }}
                      </span>
                    </td>
                    <td>
                      <div class="inline-actions">
                        <a class="btn-secondary" [routerLink]="['/calculations', calculation.id, 'edit']">Editar</a>
                        <button type="button" class="btn-danger" (click)="openDelete(calculation)">Excluir</button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </article>
    </section>

    <lexia-confirm-dialog
      [visible]="confirmTarget() !== null"
      title="Excluir cálculo"
      [message]="'Deseja excluir o cálculo ' + (confirmTarget()?.title ?? '') + '? Esta ação não pode ser desfeita.'"
      confirmLabel="Excluir"
      (confirmed)="deleteConfirmed()"
      (cancelled)="confirmTarget.set(null)"
    />
  `,
})
export class CalculationListComponent implements OnInit {
  private readonly calculationsService = inject(CalculationsService);

  readonly calculations = signal<Calculation[]>([]);
  readonly loading = signal(true);
  readonly errorMessage = signal('');
  readonly confirmTarget = signal<Calculation | null>(null);

  ngOnInit(): void {
    this.loadCalculations();
  }

  loadCalculations(): void {
    this.loading.set(true);
    this.errorMessage.set('');
    this.calculationsService.list().subscribe({
      next: (calculations) => {
        this.calculations.set(calculations);
        this.loading.set(false);
      },
      error: (error: Error) => {
        this.loading.set(false);
        this.errorMessage.set(error.message);
      },
    });
  }

  openDelete(calculation: Calculation): void {
    this.confirmTarget.set(calculation);
  }

  deleteConfirmed(): void {
    const target = this.confirmTarget();
    this.confirmTarget.set(null);
    if (!target) return;

    this.calculationsService.delete(target.id).subscribe({
      next: () => this.loadCalculations(),
      error: (error: Error) => this.errorMessage.set(error.message),
    });
  }

  typeLabel(type: CalculationType): string {
    return TYPE_LABELS[type];
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  }
}
