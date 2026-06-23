import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LegalCase } from '../../../core/models/case.model';
import { Document } from '../../../core/models/document.model';
import { CaseService } from '../../../core/services/case.service';
import { DocumentService } from '../../../core/services/document.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { LexIADatePipe } from '../../../shared/pipes/lexia-date.pipe';
import { toNullable } from '../../../shared/utils/form.utils';

@Component({
  selector: 'lexia-document-list',
  standalone: true,
  imports: [ReactiveFormsModule, ConfirmDialogComponent, LexIADatePipe],
  template: `
    <!-- DIRECT.md: nenhum documento poderÃ¡ ser enviado automaticamente -->
    <div class="ai-disclaimer">
      <span>ðŸ“„</span>
      <span>
        <strong>Controle de documentos</strong>
        Nenhum documento Ã© enviado automaticamente. Todo envio requer aÃ§Ã£o explÃ­cita do advogado.
        Documentos analisados por IA sÃ£o apenas processados para extraÃ§Ã£o de conteÃºdo.
      </span>
    </div>

    <section class="page">
      <header class="page-header">
        <div>
          <h2>Documentos</h2>
          <p>Selecione um caso para listar e enviar documentos.</p>
        </div>
      </header>

      @if (errorMessage()) {
        <p class="alert alert-error">{{ errorMessage() }}</p>
      }
      @if (successMessage()) {
        <p class="alert alert-success">{{ successMessage() }}</p>
      }

      <article class="card">
        <form class="form-stack" [formGroup]="form" (ngSubmit)="upload()" novalidate>
          <div class="form-grid">
            <label>
              Caso
              <select formControlName="case_id" (change)="loadDocuments()">
                <option value="">Selecione</option>
                @for (legalCase of cases(); track legalCase.id) {
                  <option [value]="legalCase.id">{{ legalCase.title }}</option>
                }
              </select>
            </label>

            <label>
              Tipo do documento
              <input type="text" formControlName="document_type" placeholder="Contrato, procuraÃ§Ã£o, laudo..." />
            </label>

            <label>
              Arquivo
              <input type="file" (change)="onFileSelected($event)" />
              <span class="field-hint">{{ selectedFile()?.name || 'Nenhum arquivo selecionado' }}</span>
            </label>
          </div>

          <div class="actions">
            <button type="submit" class="btn-primary" [disabled]="uploading()">
              {{ uploading() ? 'Enviando...' : 'Enviar documento' }}
            </button>
            <button type="button" class="btn-secondary" (click)="loadDocuments()" [disabled]="documentsLoading()">
              Atualizar lista
            </button>
          </div>
        </form>
      </article>

      <article class="card">
        @if (!form.controls.case_id.value) {
          <div class="empty-state">
            <h3>Selecione um caso</h3>
            <p>Os documentos serÃ£o exibidos apÃ³s a seleÃ§Ã£o do caso.</p>
          </div>
        } @else if (documentsLoading()) {
          <p>Carregando documentos...</p>
        } @else if (!documents().length) {
          <div class="empty-state">
            <h3>Nenhum documento encontrado</h3>
            <p>Envie o primeiro documento para este caso.</p>
          </div>
        } @else {
          <div class="table-wrapper">
            <table class="table">
              <thead>
                <tr>
                  <th>Arquivo</th>
                  <th>Tipo</th>
                  <th>Tamanho</th>
                  <th>Enviado em</th>
                  <th>AÃ§Ãµes</th>
                </tr>
              </thead>
              <tbody>
                @for (document of documents(); track document.id) {
                  <tr>
                    <td>{{ document.original_file_name }}</td>
                    <td>{{ document.document_type || 'â€”' }}</td>
                    <td>{{ formatSize(document.file_size) }}</td>
                    <td>{{ document.created_at | lexiaDate }}</td>
                    <td>
                      <button type="button" class="btn-danger" (click)="openDelete(document)">Excluir</button>
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
      title="Excluir documento"
      [message]="'Deseja excluir o documento ' + (confirmTarget()?.original_file_name ?? '') + '? Esta aÃ§Ã£o nÃ£o pode ser desfeita.'"
      confirmLabel="Excluir"
      (confirmed)="deleteConfirmed()"
      (cancelled)="confirmTarget.set(null)"
    />
  `,
})
export class DocumentListComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly caseService = inject(CaseService);
  private readonly documentService = inject(DocumentService);

  readonly cases = signal<LegalCase[]>([]);
  readonly documents = signal<Document[]>([]);
  readonly selectedFile = signal<File | null>(null);
  readonly uploading = signal(false);
  readonly documentsLoading = signal(false);
  readonly errorMessage = signal('');
  readonly successMessage = signal('');
  readonly confirmTarget = signal<Document | null>(null);

  readonly form = this.formBuilder.nonNullable.group({
    case_id: ['', [Validators.required]],
    document_type: [''],
  });

  ngOnInit(): void {
    this.caseService.list().subscribe({
      next: (cases) => this.cases.set(cases),
      error: (error: Error) => this.errorMessage.set(error.message),
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFile.set(input.files?.item(0) ?? null);
  }

  loadDocuments(): void {
    const caseId = this.form.controls.case_id.value;
    this.errorMessage.set('');
    this.successMessage.set('');

    if (!caseId) {
      this.documents.set([]);
      return;
    }

    this.documentsLoading.set(true);
    this.documentService.listByCase(caseId).subscribe({
      next: (documents) => {
        this.documents.set(documents);
        this.documentsLoading.set(false);
      },
      error: (error: Error) => {
        this.documentsLoading.set(false);
        this.errorMessage.set(error.message);
      },
    });
  }

  upload(): void {
    this.errorMessage.set('');
    this.successMessage.set('');

    if (this.form.controls.case_id.invalid || !this.selectedFile()) {
      this.errorMessage.set('Selecione um caso e um arquivo para envio.');
      return;
    }

    this.uploading.set(true);
    this.documentService
      .upload(
        this.form.controls.case_id.value,
        this.selectedFile() as File,
        toNullable(this.form.controls.document_type.value),
      )
      .subscribe({
        next: () => {
          this.uploading.set(false);
          this.successMessage.set('Documento enviado com sucesso.');
          this.form.controls.document_type.setValue('');
          this.selectedFile.set(null);
          this.loadDocuments();
        },
        error: (error: Error) => {
          this.uploading.set(false);
          this.errorMessage.set(error.message);
        },
      });
  }

  openDelete(document: Document): void {
    this.confirmTarget.set(document);
  }

  deleteConfirmed(): void {
    const target = this.confirmTarget();
    this.confirmTarget.set(null);
    if (!target) return;

    this.documentService.delete(target.id).subscribe({
      next: () => {
        this.successMessage.set('Documento excluÃ­do com sucesso.');
        this.loadDocuments();
      },
      error: (error: Error) => this.errorMessage.set(error.message),
    });
  }

  formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
}
