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
  templateUrl: './document-list.component.html',
  styleUrl: './document-list.component.css'
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

  private fileInput: HTMLInputElement | null = null;

  ngOnInit(): void {
    this.caseService.list().subscribe({
      next: (cases) => this.cases.set(cases),
      error: (error: Error) => this.errorMessage.set(error.message),
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.fileInput = input;
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
          if (this.fileInput) {
            this.fileInput.value = '';
          }
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
        this.successMessage.set('Documento excluído com sucesso.');
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
