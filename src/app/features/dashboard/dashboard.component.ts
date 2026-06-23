import { Component, inject, OnInit, signal } from '@angular/core';
import { forkJoin } from 'rxjs';
import { CaseService } from '../../core/services/case.service';
import { ClientService } from '../../core/services/client.service';
import { DeadlineService } from '../../core/services/deadline.service';
import { HearingService } from '../../core/services/hearing.service';

interface DashboardMetrics {
  clients: number;
  cases: number;
  deadlines: number;
  hearings: number;
}

@Component({
  selector: 'lexia-dashboard',
  standalone: true,
  template: `
    <section class="page">
      <header class="page-header">
        <div>
          <h2>Dashboard operacional</h2>
          <p>Visão rápida da operação do escritório autenticado.</p>
        </div>
        <button type="button" class="btn-secondary" (click)="loadMetrics()" [disabled]="loading()">Atualizar</button>
      </header>

      @if (errorMessage()) {
        <p class="alert alert-error">{{ errorMessage() }}</p>
      }

      @if (loading()) {
        <article class="card">
          <p>Carregando métricas...</p>
        </article>
      } @else {
        <div class="metrics-grid">
          <article class="card metric-card">
            <span class="metric-label">Clientes</span>
            <strong class="metric-value">{{ metrics().clients }}</strong>
          </article>
          <article class="card metric-card">
            <span class="metric-label">Casos</span>
            <strong class="metric-value">{{ metrics().cases }}</strong>
          </article>
          <article class="card metric-card">
            <span class="metric-label">Prazos</span>
            <strong class="metric-value">{{ metrics().deadlines }}</strong>
          </article>
          <article class="card metric-card">
            <span class="metric-label">Audiências</span>
            <strong class="metric-value">{{ metrics().hearings }}</strong>
          </article>
        </div>
      }
    </section>
  `,
})
export class DashboardComponent implements OnInit {
  private readonly clientService = inject(ClientService);
  private readonly caseService = inject(CaseService);
  private readonly deadlineService = inject(DeadlineService);
  private readonly hearingService = inject(HearingService);

  readonly loading = signal(true);
  readonly errorMessage = signal('');
  readonly metrics = signal<DashboardMetrics>({ clients: 0, cases: 0, deadlines: 0, hearings: 0 });

  ngOnInit(): void {
    this.loadMetrics();
  }

  loadMetrics(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    forkJoin({
      clients: this.clientService.list(),
      cases: this.caseService.list(),
      deadlines: this.deadlineService.list(),
      hearings: this.hearingService.list(),
    }).subscribe({
      next: ({ clients, cases, deadlines, hearings }) => {
        this.metrics.set({
          clients: clients.length,
          cases: cases.length,
          deadlines: deadlines.length,
          hearings: hearings.length,
        });
        this.loading.set(false);
      },
      error: (error: Error) => {
        this.loading.set(false);
        this.errorMessage.set(error.message);
      },
    });
  }
}
