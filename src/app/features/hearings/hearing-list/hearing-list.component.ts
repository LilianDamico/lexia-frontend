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
  templateUrl: './hearing-list.component.html',
  styleUrl: './hearing-list.component.css'
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
