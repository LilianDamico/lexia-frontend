import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { AuditEvent, AuditService } from '../audit.service';
import { LexIADatePipe } from '../../../shared/pipes/lexia-date.pipe';

@Component({
  selector: 'lexia-audit-list',
  standalone: true,
  imports: [ReactiveFormsModule, LexIADatePipe],
  templateUrl: './audit-list.component.html',
  styleUrl: './audit-list.component.css'
})
export class AuditListComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly auditService = inject(AuditService);
  private readonly destroyRef = inject(DestroyRef);

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
    this.filtersForm.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((value) => {
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
