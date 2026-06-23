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
  template: `
    <!-- DIRECT.md: IA apenas executa análises e sugestões solicitadas pelo advogado -->
    <div class="ai-disclaimer">
      <span>⚠️</span>
      <span>
        <strong>Atenção — Pesquisa assistida por IA</strong>
        O resultado desta pesquisa é uma análise assistida. Toda conclusão deve ser verificada pelo advogado.
        A responsabilidade jurídica pertence exclusivamente ao profissional habilitado.
      </span>
    </div>

    <section class="page">
      <header class="page-header">
        <div>
          <h2>Pesquisa jurídica interna</h2>
          <p>Consulte a base da LexIA com apoio do motor de IA.</p>
        </div>
      </header>

      @if (errorMessage()) {
        <p class="alert alert-error">{{ errorMessage() }}</p>
      }

      <article class="card">
        <form class="form-stack" [formGroup]="form" (ngSubmit)="search()" novalidate>
          <label>
            Pergunta jurídica
            <textarea formControlName="query" placeholder="Descreva a dúvida, contexto e objetivo da pesquisa"></textarea>
            @if (submitted() && form.controls.query.invalid) {
              <span class="field-error">Informe a pergunta para executar a pesquisa.</span>
            }
          </label>
          <div class="actions">
            <button type="submit" class="btn-primary" [disabled]="loading()">
              {{ loading() ? 'Pesquisando...' : 'Pesquisar' }}
            </button>
          </div>
        </form>
      </article>

      @if (result()) {
        <article class="card">
          <h3>Resposta</h3>
          <pre class="answer-block">{{ result()!.answer }}</pre>

          <!-- DIRECT.md: toda informação apresentada deve indicar Fonte, Trecho, Tipo, Nível de confiança e Origem -->
          @if (hasMetadata()) {
            <dl class="confidence-block" style="margin-top:1rem;">
              @if (result()!.information_type) {
                <dt>Tipo da informação</dt>
                <dd>{{ result()!.information_type }}</dd>
              }
              @if (result()!.confidence_level) {
                <dt>Nível de confiança</dt>
                <dd>{{ confidenceLabel(result()!.confidence_level) }}</dd>
              }
              @if (result()!.source) {
                <dt>Fonte</dt>
                <dd>{{ result()!.source }}</dd>
              }
              @if (result()!.excerpt) {
                <dt>Trecho utilizado</dt>
                <dd>{{ result()!.excerpt }}</dd>
              }
              @if (result()!.evidence_origin) {
                <dt>Origem da evidência</dt>
                <dd>{{ result()!.evidence_origin }}</dd>
              }
            </dl>
          } @else {
            <p class="muted" style="margin-top:.75rem; font-size:.85rem;">
              ℹ️ Metadados de confiabilidade não disponíveis para esta resposta. Verifique as fontes independentemente.
            </p>
          }
        </article>
      }
    </section>
  `,
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
