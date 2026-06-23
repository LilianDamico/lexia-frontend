import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Hearing } from '../../../core/models/hearing.model';
import { HearingService } from '../../../core/services/hearing.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { LexIADatePipe } from '../../../shared/pipes/lexia-date.pipe';

@Component({
  selector: 'lexia-hearing-list',
  standalone: true,
  imports: [RouterLink, ConfirmDialogComponent, LexIADatePipe],
  template: `
    <section class="page">
      <header class="page-header">
        <div>
          <h2>Audiências</h2>
          <p>Controle agendamentos, locais e andamento das audiências.</p>
        </div>
        <div class="actions">
          <button type="button" class="btn-secondary" (click)="loadHearings()" [disabled]="loading()">Atualizar</button>
          <a class="btn-primary" routerLink="/hearings/new">Nova audiência</a>
        </div>
      </header>

      @if (errorMessage()) {
        <p class="alert alert-error">{{ errorMessage() }}</p>
      }

      <article class="card">
        @if (loading()) {
          <p>Carregando audiências...</p>
        } @else if (!hearings().length) {
          <div class="empty-state">
            <h3>Nenhuma audiência cadastrada</h3>
            <p>Cadastre audiências para organizar a agenda contenciosa.</p>
          </div>
        } @else {
          <div class="table-wrapper">
            <table class="table">
              <thead>
                <tr>
                  <th>Título</th>
                  <th>Tipo</th>
                  <th>Agendada para</th>
                  <th>Local</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                @for (hearing of hearings(); track hearing.id) {
                  <tr>
                    <td>{{ hearing.title }}</td>
                    <td>{{ hearing.hearing_type || '—' }}</td>
                    <td>{{ hearing.scheduled_at | lexiaDate }}</td>
                    <td>{{ hearing.location || '—' }}</td>
                    <td><span class="status-badge {{ hearing.status }}">{{ hearing.status }}</span></td>
                    <td>
                      <div class="inline-actions">
                        <a class="btn-secondary" [routerLink]="['/hearings', hearing.id, 'edit']">Editar</a>
                        <button type="button" class="btn-danger" (click)="openDelete(hearing)">Excluir</button>
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
      title="Excluir audiência"
      [message]="'Deseja excluir a audiência ' + (confirmTarget()?.title ?? '') + '?'"
      confirmLabel="Excluir"
      (confirmed)="deleteConfirmed()"
      (cancelled)="confirmTarget.set(null)"
    />
  `,
})
export class HearingListComponent implements OnInit {
  private readonly hearingService = inject(HearingService);

  readonly hearings = signal<Hearing[]>([]);
  readonly loading = signal(true);
  readonly errorMessage = signal('');
  readonly confirmTarget = signal<Hearing | null>(null);

  ngOnInit(): void {
    this.loadHearings();
  }

  loadHearings(): void {
    this.loading.set(true);
    this.errorMessage.set('');
    this.hearingService.list().subscribe({
      next: (hearings) => {
        this.hearings.set(hearings);
        this.loading.set(false);
      },
      error: (error: Error) => {
        this.loading.set(false);
        this.errorMessage.set(error.message);
      },
    });
  }

  openDelete(hearing: Hearing): void {
    this.confirmTarget.set(hearing);
  }

  deleteConfirmed(): void {
    const target = this.confirmTarget();
    this.confirmTarget.set(null);
    if (!target) return;

    this.hearingService.delete(target.id).subscribe({
      next: () => this.loadHearings(),
      error: (error: Error) => this.errorMessage.set(error.message),
    });
  }
}
