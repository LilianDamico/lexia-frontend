import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ResearchResponse } from '../../core/models/research.model';
import { ResearchService } from '../../core/services/research.service';

const CONFIDENCE_LABELS: Record<string, string> = {
  high: 'Alta',
  medium: 'Média',
  low: 'Baixa',
  unknown: 'Não verificada',
};

@Component({
  selector: 'lexia-research',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './research.component.html',
  styleUrl: './research.component.css'
})
export class ResearchComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly researchService = inject(ResearchService);

  readonly loading = signal(false);
  readonly submitted = signal(false);
  readonly result = signal<ResearchResponse | null>(null);
  readonly errorMessage = signal('');

  readonly form = this.formBuilder.nonNullable.group({
    query: ['', [Validators.required]],
  });

  search(): void {
    this.submitted.set(true);
    this.errorMessage.set('');
    this.result.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.researchService.search({ query: this.form.controls.query.value }).subscribe({
      next: (response) => {
        this.loading.set(false);
        this.result.set(response);
      },
      error: (error: Error) => {
        this.loading.set(false);
        this.errorMessage.set(error.message);
      },
    });
  }

  hasMetadata(): boolean {
    const r = this.result();
    return Boolean(r?.source || r?.excerpt || r?.confidence_level || r?.information_type || r?.evidence_origin);
  }

  confidenceLabel(level: string | null | undefined): string {
    return level ? (CONFIDENCE_LABELS[level] ?? level) : '—';
  }
}
