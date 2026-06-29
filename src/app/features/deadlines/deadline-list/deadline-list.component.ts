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
  templateUrl: './deadline-list.component.html',
  styleUrl: './deadline-list.component.css'
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
