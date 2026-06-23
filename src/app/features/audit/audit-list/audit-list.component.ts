import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { AuditEvent, AuditService } from '../audit.service';
import { LexIADatePipe } from '../../../shared/pipes/lexia-date.pipe';

@Component({
  selector: 'lexia-audit-list',
  standalone: true,
  imports: [ReactiveFormsModule, LexIADatePipe],
  template: `
    <div class="ai-disclaimer">
      <span>⚠️</span>
      <span>⚠️ Esta informação foi gerada por IA e requer revisão humana.</span>
    </div>

    <section class="page">
      <header class="page-header">
        <div>
          <h2>Auditoria</h2>
          <p>Monitore eventos administrativos e operacionais sensíveis do escritório.</p>
        </div>
        <button type="button" class="btn-secondary" (click)="loadEvents()" [disabled]="loading()">Atualizar</button>
      </header>

      @if (errorMessage()) {
        <p class="alert alert-error">{{ errorMessage() }}</p>
      }

      <article class="card">
        <form class="filters" [formGroup]="filtersForm">
          <label>
            Tipo de evento
            <select formControlName="event_type">
              <option value="">Todos</option>
              @for (eventType of eventTypes(); track eventType) {
                <option [value]="eventType">{{ eventType }}</option>
              }
            </select>
          </label>

          <label>
            Data
            <input type="date" formControlName="date" />
          </label>
        </form>
      </article>

      <article class="card">
        @if (loading()) {
          <p>Carregando eventos de auditoria...</p>
        } @else if (!filteredEvents().length) {
          <div class="empty-state">
            <h3>Nenhum evento encontrado</h3>
            <p>Ajuste os filtros ou aguarde novos registros de auditoria.</p>
          </div>
        } @else {
          <div class="table-wrapper">
            <table class="table">
              <thead>
                <tr>
                  <th>Data/hora</th>
                  <th>Tipo do evento</th>
                  <th>Entidade</th>
                  <th>Usuário</th>
                  <th>Detalhes</th>
                </tr>
              </thead>
              <tbody>
                @for (event of filteredEvents(); track event.id) {
                  <tr>
                    <td>{{ event.created_at | lexiaDate }}</td>
                    <td><span class="status-badge processing">{{ event.event_type }}</span></td>
                    <td>{{ entityLabel(event) }}</td>
                    <td>{{ event.user_email || event.user_id || '—' }}</td>
                    <td>
                      <details class="json-details">
                        <summary>Ver JSON</summary>
                        <pre>{{ stringifyDetails(event.details) }}</pre>
                      </details>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </article>
    </section>
  `,
  styles: [`
    .json-details summary {
      cursor: pointer;
      color: #174ea6;
      font-weight: 600;
    }
    .json-details pre {
      margin: 0.75rem 0 0;
      padding: 0.85rem;
      border-radius: 12px;
      background: #0f172a;
      color: #e2e8f0;
      white-space: pre-wrap;
      word-break: break-word;
      max-width: 420px;
    }
  `],
})
export class AuditListComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly auditService = inject(AuditService);

  readonly events = signal<AuditEvent[]>([]);
  readonly loading = signal(true);
  readonly errorMessage = signal('');
  readonly selectedEventType = signal('');
  readonly selectedDate = signal('');
  readonly filtersForm = this.formBuilder.nonNullable.group({
    event_type: [''],
    date: [''],
  });
  readonly eventTypes = computed(() => [...new Set(this.events().map((event) => event.event_type))].sort());
  readonly filteredEvents = computed(() => {
    const eventType = this.selectedEventType();
    const date = this.selectedDate();

    return this.events().filter((event) => {
      const matchesType = !eventType || event.event_type === eventType;
      const matchesDate = !date || event.created_at.slice(0, 10) === date;
      return matchesType && matchesDate;
    });
  });

  ngOnInit(): void {
    this.filtersForm.valueChanges.subscribe((value) => {
      this.selectedEventType.set(value.event_type ?? '');
      this.selectedDate.set(value.date ?? '');
    });
    this.loadEvents();
  }

  loadEvents(): void {
    this.loading.set(true);
    this.errorMessage.set('');
    this.auditService.list().subscribe({
      next: (events) => {
        this.events.set(events);
        this.loading.set(false);
      },
      error: (error: Error) => {
        this.loading.set(false);
        this.errorMessage.set(error.message);
      },
    });
  }

  entityLabel(event: AuditEvent): string {
    if (!event.entity_type && !event.entity_id) return '—';
    return `${event.entity_type || 'entidade'}${event.entity_id ? ` • ${event.entity_id}` : ''}`;
  }

  stringifyDetails(details: Record<string, unknown>): string {
    return JSON.stringify(details, null, 2);
  }
}
