import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { LegalCase } from '../../../core/models/case.model';
import { Deadline } from '../../../core/models/deadline.model';
import { Hearing } from '../../../core/models/hearing.model';
import { CaseService } from '../../../core/services/case.service';
import { DeadlineService } from '../../../core/services/deadline.service';
import { HearingService } from '../../../core/services/hearing.service';
import { LexIADatePipe } from '../../../shared/pipes/lexia-date.pipe';

const STATUS_LABELS: Record<string, string> = {
  draft: 'Rascunho',
  active: 'Ativo',
  suspended: 'Suspenso',
  closed: 'Encerrado',
  archived: 'Arquivado',
  pending: 'Pendente',
  completed: 'Concluído',
  expired: 'Vencido',
  cancelled: 'Cancelado',
  scheduled: 'Agendada',
  postponed: 'Adiada',
};

@Component({
  selector: 'lexia-case-detail',
  standalone: true,
  imports: [RouterLink, LexIADatePipe],
  template: `
    <section class="page">
      <header class="page-header">
        <div>
          <h2>{{ legalCase()?.title ?? 'Carregando...' }}</h2>
          @if (legalCase()) {
            <p>
              <span class="badge">{{ statusLabel(legalCase()!.status) }}</span>
              @if (legalCase()!.case_number) {
                <span class="text-muted">Nº {{ legalCase()!.case_number }}</span>
              }
              @if (legalCase()!.court) {
                <span class="text-muted"> · {{ legalCase()!.court }}</span>
              }
            </p>
          }
        </div>
        <div class="actions">
          <a class="btn-secondary" routerLink="/cases">Voltar</a>
          @if (legalCase()) {
            <a class="btn-primary" [routerLink]="['/cases', legalCase()!.id, 'edit']">Editar caso</a>
          }
        </div>
      </header>

      @if (errorMessage()) {
        <p class="alert alert-error">{{ errorMessage() }}</p>
      }

      @if (loading()) {
        <p>Carregando detalhes do caso...</p>
      } @else if (legalCase()) {

        <!-- Informações gerais -->
        <article class="card">
          <h3>Informações gerais</h3>
          <div class="form-grid">
            @if (legalCase()!.description) {
              <div class="full-width">
                <strong>Descrição</strong>
                <p>{{ legalCase()!.description }}</p>
              </div>
            }
            @if (legalCase()!.facts_summary) {
              <div class="full-width">
                <strong>Resumo dos fatos</strong>
                <p>{{ legalCase()!.facts_summary }}</p>
              </div>
            }
            @if (legalCase()!.strategy_notes) {
              <div class="full-width">
                <strong>Notas estratégicas</strong>
                <p>{{ legalCase()!.strategy_notes }}</p>
              </div>
            }
            @if (legalCase()!.ai_summary) {
              <div class="full-width ai-disclaimer">
                <span>🤖</span>
                <div>
                  <strong>Resumo gerado por IA</strong>
                  <p>{{ legalCase()!.ai_summary }}</p>
                </div>
              </div>
            }
          </div>
        </article>

        <!-- Prazos -->
        <article class="card">
          <div class="card-header">
            <h3>Prazos</h3>
            <a class="btn-secondary" [routerLink]="['/deadlines/new']">+ Novo prazo</a>
          </div>
          @if (!deadlines().length) {
            <div class="empty-state">
              <p>Nenhum prazo cadastrado para este caso.</p>
            </div>
          } @else {
            <div class="table-wrapper">
              <table class="table">
                <thead>
                  <tr>
                    <th>Título</th>
                    <th>Vencimento</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  @for (deadline of deadlines(); track deadline.id) {
                    <tr [class.row-warning]="isOverdue(deadline)">
                      <td>{{ deadline.title }}</td>
                      <td>{{ deadline.due_at | lexiaDate }}</td>
                      <td>
                        <span class="badge" [class]="'badge-' + deadline.status">
                          {{ statusLabel(deadline.status) }}
                        </span>
                      </td>
                      <td>
                        <a class="btn-secondary btn-sm" [routerLink]="['/deadlines', deadline.id, 'edit']">Editar</a>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </article>

        <!-- Audiências -->
        <article class="card">
          <div class="card-header">
            <h3>Audiências</h3>
            <a class="btn-secondary" [routerLink]="['/hearings/new']">+ Nova audiência</a>
          </div>
          @if (!hearings().length) {
            <div class="empty-state">
              <p>Nenhuma audiência cadastrada para este caso.</p>
            </div>
          } @else {
            <div class="table-wrapper">
              <table class="table">
                <thead>
                  <tr>
                    <th>Título</th>
                    <th>Data</th>
                    <th>Local</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  @for (hearing of hearings(); track hearing.id) {
                    <tr>
                      <td>{{ hearing.title }}</td>
                      <td>{{ hearing.scheduled_at | lexiaDate }}</td>
                      <td>{{ hearing.location ?? '—' }}</td>
                      <td>
                        <span class="badge" [class]="'badge-' + hearing.status">
                          {{ statusLabel(hearing.status) }}
                        </span>
                      </td>
                      <td>
                        <a class="btn-secondary btn-sm" [routerLink]="['/hearings', hearing.id, 'edit']">Editar</a>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </article>

        <!-- Links rápidos -->
        <article class="card">
          <h3>Ações rápidas</h3>
          <div class="actions">
            <a class="btn-secondary" routerLink="/documents">Ver documentos</a>
            <a class="btn-secondary" routerLink="/petitions">Ver petições</a>
            <a class="btn-secondary" routerLink="/research">Pesquisa jurídica</a>
          </div>
        </article>

      }
    </section>
  `,
  styles: [`
    .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 0.8rem; background: var(--color-neutral-100, #f3f4f6); }
    .badge-active, .badge-completed { background: #d1fae5; color: #065f46; }
    .badge-pending, .badge-scheduled { background: #fef3c7; color: #92400e; }
    .badge-expired, .badge-cancelled { background: #fee2e2; color: #991b1b; }
    .row-warning td { background: #fff7ed; }
    .text-muted { color: var(--color-neutral-500, #6b7280); font-size: 0.9rem; margin-left: 0.5rem; }
    .btn-sm { padding: 2px 8px; font-size: 0.8rem; }
  `],
})
export class CaseDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly caseService = inject(CaseService);
  private readonly deadlineService = inject(DeadlineService);
  private readonly hearingService = inject(HearingService);

  readonly legalCase = signal<LegalCase | null>(null);
  readonly deadlines = signal<Deadline[]>([]);
  readonly hearings = signal<Hearing[]>([]);
  readonly loading = signal(true);
  readonly errorMessage = signal('');

  private caseId = '';

  ngOnInit(): void {
    this.caseId = this.route.snapshot.paramMap.get('id') ?? '';
    if (!this.caseId) {
      void this.router.navigate(['/cases']);
      return;
    }
    this.loadAll();
  }

  statusLabel(status: string): string {
    return STATUS_LABELS[status] ?? status;
  }

  isOverdue(deadline: Deadline): boolean {
    return deadline.status === 'pending' && new Date(deadline.due_at) < new Date();
  }

  private loadAll(): void {
    this.loading.set(true);
    forkJoin({
      legalCase: this.caseService.getById(this.caseId),
      deadlines: this.deadlineService.listByCase(this.caseId),
      hearings: this.hearingService.listByCase(this.caseId),
    }).subscribe({
      next: ({ legalCase, deadlines, hearings }) => {
        this.legalCase.set(legalCase);
        this.deadlines.set(deadlines);
        this.hearings.set(hearings);
        this.loading.set(false);
      },
      error: (error: Error) => {
        this.errorMessage.set(error.message);
        this.loading.set(false);
      },
    });
  }
}
