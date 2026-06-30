import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Petition } from '../../../core/models/petition.model';
import { PetitionService } from '../../../core/services/petition.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

type DialogAction = 'delete' | 'submit' | 'approve' | 'reject';

interface DialogState {
  visible: boolean;
  action: DialogAction | null;
  target: Petition | null;
  title: string;
  message: string;
  confirmLabel: string;
  confirmClass: string;
}

@Component({
  selector: 'lexia-petition-list',
  standalone: true,
  imports: [RouterLink, ConfirmDialogComponent, FormsModule],
  templateUrl: './petition-list.component.html',
  styleUrl: './petition-list.component.css'
})
export class PetitionListComponent implements OnInit {
  private readonly petitionService = inject(PetitionService);

  readonly petitions = signal<Petition[]>([]);
  readonly loading = signal(true);
  readonly errorMessage = signal('');
  readonly successMessage = signal('');
  readonly showRejectForm = signal(false);
  readonly rejectionReason = signal('');

  readonly dialog = signal<DialogState>({
    visible: false,
    action: null,
    target: null,
    title: '',
    message: '',
    confirmLabel: 'Confirmar',
    confirmClass: 'btn-danger',
  });

  private readonly STATUS_LABELS: Record<string, string> = {
    pending: 'Pendente',
    processing: 'Processando',
    generated: 'Gerada',
    validated: 'Validada',
    approved: 'Aprovada',
    rejected: 'Rejeitada',
  };

  ngOnInit(): void {
    this.loadPetitions();
  }

  loadPetitions(): void {
    this.loading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');
    this.petitionService.list().subscribe({
      next: (petitions) => {
        this.petitions.set(petitions);
        this.loading.set(false);
      },
      error: (error: Error) => {
        this.loading.set(false);
        this.errorMessage.set(error.message);
      },
    });
  }

  statusLabel(status: string): string {
    return this.STATUS_LABELS[status] ?? status;
  }

  canSubmit(petition: Petition): boolean {
    return petition.operation_status === 'pending' || petition.operation_status === 'generated';
  }

  canApprove(petition: Petition): boolean {
    return petition.operation_status === 'validated' || petition.operation_status === 'generated';
  }

  canReject(petition: Petition): boolean {
    return petition.operation_status === 'generated' || petition.operation_status === 'validated';
  }

  openSubmit(petition: Petition): void {
    this.dialog.set({
      visible: true,
      action: 'submit',
      target: petition,
      title: 'Submeter para revisão',
      message: `Deseja submeter "${petition.title}" para revisão do advogado responsável?`,
      confirmLabel: 'Submeter',
      confirmClass: 'btn-secondary',
    });
  }

  openApprove(petition: Petition): void {
    this.dialog.set({
      visible: true,
      action: 'approve',
      target: petition,
      title: 'Aprovar petição',
      message: `Confirme a aprovação da petição "${petition.title}". Esta ação indica que o advogado revisou e autoriza o uso do conteúdo.`,
      confirmLabel: 'Aprovar',
      confirmClass: 'btn-approve',
    });
  }

  openReject(petition: Petition): void {
    this.dialog.set({ ...this.dialog(), action: 'reject', target: petition, visible: false });
    this.rejectionReason.set('');
    this.showRejectForm.set(true);
  }

  openDelete(petition: Petition): void {
    this.dialog.set({
      visible: true,
      action: 'delete',
      target: petition,
      title: 'Excluir petição',
      message: `Deseja excluir permanentemente a petição "${petition.title}"?`,
      confirmLabel: 'Excluir',
      confirmClass: 'btn-danger',
    });
  }

  closeDialog(): void {
    this.dialog.update(d => ({ ...d, visible: false, target: null, action: null }));
  }

  closeReject(): void {
    this.showRejectForm.set(false);
    this.rejectionReason.set('');
  }

  executeAction(): void {
    const { action, target } = this.dialog();
    if (!action || !target) return;
    this.closeDialog();

    if (action === 'delete') {
      this.petitionService.delete(target.id).subscribe({
        next: () => {
          this.successMessage.set('Petição excluída.');
          this.loadPetitions();
        },
        error: (error: Error) => this.errorMessage.set(error.message),
      });
    }

    if (action === 'submit') {
      this.petitionService.submit(target.id).subscribe({
        next: () => {
          this.successMessage.set('Petição submetida para revisão com sucesso.');
          this.loadPetitions();
        },
        error: (error: Error) => this.errorMessage.set(error.message),
      });
    }

    if (action === 'approve') {
      this.petitionService.approve(target.id).subscribe({
        next: () => {
          this.successMessage.set('Petição aprovada com sucesso.');
          this.loadPetitions();
        },
        error: (error: Error) => this.errorMessage.set(error.message),
      });
    }
  }

  confirmReject(): void {
    const target = this.dialog().target;
    if (!target || this.rejectionReason().trim().length < 10) return;

    this.showRejectForm.set(false);
    this.petitionService.reject(target.id, { rejection_reason: this.rejectionReason().trim() }).subscribe({
      next: () => {
        this.successMessage.set('Petição rejeitada. Motivo registrado para rastreabilidade.');
        this.rejectionReason.set('');
        this.loadPetitions();
      },
      error: (error: Error) => this.errorMessage.set(error.message),
    });
  }
}
