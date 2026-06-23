import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LegalCase } from '../../../core/models/case.model';
import { CaseService } from '../../../core/services/case.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { LexIADatePipe } from '../../../shared/pipes/lexia-date.pipe';

@Component({
  selector: 'lexia-case-list',
  standalone: true,
  imports: [RouterLink, ConfirmDialogComponent, LexIADatePipe],
  template: `
    <section class="page">
      <header class="page-header">
        <div>
          <h2>Casos</h2>
          <p>Controle os casos jurídicos e sua evolução processual.</p>
        </div>
        <div class="actions">
          <button type="button" class="btn-secondary" (click)="loadCases()" [disabled]="loading()">Atualizar</button>
          <a class="btn-primary" routerLink="/cases/new">Novo caso</a>
        </div>
      </header>

      @if (errorMessage()) {
        <p class="alert alert-error">{{ errorMessage() }}</p>
      }

      <article class="card">
        @if (loading()) {
          <p>Carregando casos...</p>
        } @else if (!cases().length) {
          <div class="empty-state">
            <h3>Nenhum caso cadastrado</h3>
            <p>Crie um caso para conectar clientes, prazos e petições.</p>
          </div>
        } @else {
          <div class="table-wrapper">
            <table class="table">
              <thead>
                <tr>
                  <th>Título</th>
                  <th>Status</th>
                  <th>Número</th>
                  <th>Tribunal</th>
                  <th>Atualizado em</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                @for (legalCase of cases(); track legalCase.id) {
                  <tr>
                    <td>{{ legalCase.title }}</td>
                    <td><span class="status-badge {{ legalCase.status }}">{{ legalCase.status }}</span></td>
                    <td>{{ legalCase.case_number || '—' }}</td>
                    <td>{{ legalCase.court || '—' }}</td>
                    <td>{{ legalCase.updated_at | lexiaDate }}</td>
                    <td>
                      <div class="inline-actions">
                        <a class="btn-secondary" [routerLink]="['/cases', legalCase.id]">Detalhes</a>
                        <a class="btn-secondary" [routerLink]="['/cases', legalCase.id, 'edit']">Editar</a>
                        <button type="button" class="btn-danger" (click)="openDelete(legalCase)">Excluir</button>
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
      title="Excluir caso"
      [message]="'Deseja excluir o caso ' + (confirmTarget()?.title ?? '') + '? Todos os vínculos associados serão afetados.'"
      confirmLabel="Excluir"
      (confirmed)="deleteConfirmed()"
      (cancelled)="confirmTarget.set(null)"
    />
  `,
})
export class CaseListComponent implements OnInit {
  private readonly caseService = inject(CaseService);

  readonly cases = signal<LegalCase[]>([]);
  readonly loading = signal(true);
  readonly errorMessage = signal('');
  readonly confirmTarget = signal<LegalCase | null>(null);

  ngOnInit(): void {
    this.loadCases();
  }

  loadCases(): void {
    this.loading.set(true);
    this.errorMessage.set('');
    this.caseService.list().subscribe({
      next: (cases) => {
        this.cases.set(cases);
        this.loading.set(false);
      },
      error: (error: Error) => {
        this.loading.set(false);
        this.errorMessage.set(error.message);
      },
    });
  }

  openDelete(legalCase: LegalCase): void {
    this.confirmTarget.set(legalCase);
  }

  deleteConfirmed(): void {
    const target = this.confirmTarget();
    this.confirmTarget.set(null);
    if (!target) return;

    this.caseService.delete(target.id).subscribe({
      next: () => this.loadCases(),
      error: (error: Error) => this.errorMessage.set(error.message),
    });
  }
}
