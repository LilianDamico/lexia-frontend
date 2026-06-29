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
  templateUrl: './case-detail.component.html',
  styleUrl: './case-detail.component.css'
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
