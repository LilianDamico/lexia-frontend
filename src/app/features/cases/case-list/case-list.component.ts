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
  templateUrl: './case-list.component.html',
  styleUrl: './case-list.component.css'
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
