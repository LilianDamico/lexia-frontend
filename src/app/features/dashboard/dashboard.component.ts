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
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
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
