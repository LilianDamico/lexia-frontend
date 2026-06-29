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
  templateUrl: './calculation-list.component.html',
  styleUrl: './calculation-list.component.css'
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
