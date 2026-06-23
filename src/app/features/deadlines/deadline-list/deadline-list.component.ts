import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Deadline } from '../../../core/models/deadline.model';
import { DeadlineService } from '../../../core/services/deadline.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { LexIADatePipe } from '../../../shared/pipes/lexia-date.pipe';

@Component({
  selector: 'lexia-deadline-list',
  standalone: true,
  imports: [RouterLink, ConfirmDialogComponent, LexIADatePipe],
  template: `
    <section class="page">
      <header class="page-header">
        <div>
          <h2>Prazos</h2>
          <p>Monitore compromissos processuais e internos.</p>
        </div>
        <div class="actions">
          <button type="button" class="btn-secondary" (click)="loadDeadlines()" [disabled]="loading()">Atualizar</button>
          <a class="btn-primary" routerLink="/deadlines/new">Novo prazo</a>
        </div>
      </header>

      @if (errorMessage()) {
        <p class="alert alert-error">{{ errorMessage() }}</p>
      }

      <article class="card">
        @if (loading()) {
          <p>Carregando prazos...</p>
        } @else if (!deadlines().length) {
          <div class="empty-state">
            <h3>Nenhum prazo cadastrado</h3>
            <p>Crie um prazo para controlar o fluxo processual.</p>
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
                  <tr>
                    <td>{{ deadline.title }}</td>
                    <td>{{ deadline.due_at | lexiaDate }}</td>
                    <td><span class="status-badge {{ deadline.status }}">{{ deadline.status }}</span></td>
                    <td>
                      <div class="inline-actions">
                        <a class="btn-secondary" [routerLink]="['/deadlines', deadline.id, 'edit']">Editar</a>
                        <button type="button" class="btn-danger" (click)="openDelete(deadline)">Excluir</button>
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
      title="Excluir prazo"
      [message]="'Deseja excluir o prazo ' + (confirmTarget()?.title ?? '') + '?'"
      confirmLabel="Excluir"
      (confirmed)="deleteConfirmed()"
      (cancelled)="confirmTarget.set(null)"
    />
  `,
})
export class DeadlineListComponent implements OnInit {
  private readonly deadlineService = inject(DeadlineService);

  readonly deadlines = signal<Deadline[]>([]);
  readonly loading = signal(true);
  readonly errorMessage = signal('');
  readonly confirmTarget = signal<Deadline | null>(null);

  ngOnInit(): void {
    this.loadDeadlines();
  }

  loadDeadlines(): void {
    this.loading.set(true);
    this.errorMessage.set('');
    this.deadlineService.list().subscribe({
      next: (deadlines) => {
        this.deadlines.set(deadlines);
        this.loading.set(false);
      },
      error: (error: Error) => {
        this.loading.set(false);
        this.errorMessage.set(error.message);
      },
    });
  }

  openDelete(deadline: Deadline): void {
    this.confirmTarget.set(deadline);
  }

  deleteConfirmed(): void {
    const target = this.confirmTarget();
    this.confirmTarget.set(null);
    if (!target) return;

    this.deadlineService.delete(target.id).subscribe({
      next: () => this.loadDeadlines(),
      error: (error: Error) => this.errorMessage.set(error.message),
    });
  }
}
