import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Petition } from '../../../core/models/petition.model';
import { PetitionService } from '../../../core/services/petition.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

type DialogAction = 'delete' | 'approve' | 'reject';

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
  template: `
    <!-- DIRECT.md: A IA apenas sugere — responsabilidade final é do advogado -->
    <div class="ai-disclaimer">
      <span>⚠️</span>
      <span>
        <strong>Governança da IA</strong>
        Petições geradas por IA são apenas sugestões. Nenhuma peça pode ser enviada sem revisão e aprovação explícita do advogado responsável.
      </span>
    </div>

    <section class="page">
      <header class="page-header">
        <div>
          <h2>Petições</h2>
          <p>Gerencie peças produzidas manualmente ou com apoio de IA.</p>
        </div>
        <div class="actions">
          <button type="button" class="btn-secondary" (click)="loadPetitions()" [disabled]="loading()">Atualizar</button>
          <a class="btn-primary" routerLink="/petitions/new">Nova petição</a>
        </div>
      </header>

      @if (errorMessage()) {
        <p class="alert alert-error">{{ errorMessage() }}</p>
      }
      @if (successMessage()) {
        <p class="alert alert-success">{{ successMessage() }}</p>
      }

      <article class="card">
        @if (loading()) {
          <p>Carregando petições...</p>
        } @else if (!petitions().length) {
          <div class="empty-state">
            <h3>Nenhuma petição cadastrada</h3>
            <p>Crie uma petição para vincular estratégia e conteúdo ao caso.</p>
          </div>
        } @else {
          <div class="table-wrapper">
            <table class="table">
              <thead>
                <tr>
                  <th>Título</th>
                  <th>Tipo</th>
                  <th>Origem</th>
                  <th>Estado operacional</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                @for (petition of petitions(); track petition.id) {
                  <tr>
                    <td>{{ petition.title }}</td>
                    <td>{{ petition.petition_type || '—' }}</td>
                    <td>
                      <span class="status-badge">
                        {{ petition.ai_generated ? 'IA' : 'Manual' }}
                      </span>
                    </td>
                    <td>
                      <!-- DIRECT.md: estados operacionais explícitos e visualmente diferenciados -->
                      <span class="status-badge {{ petition.operation_status }}">
                        {{ statusLabel(petition.operation_status) }}
                      </span>
                    </td>
                    <td>
                      <div class="inline-actions">
                        <a class="btn-secondary" [routerLink]="['/petitions', petition.id, 'edit']">Editar</a>

                        <!-- Submeter para revisão — apenas quando pendente ou gerada -->
                        @if (canSubmit(petition)) {
                          <button type="button" class="btn-secondary" (click)="openSubmit(petition)">
                            Submeter para revisão
                          </button>
                        }

                        <!-- Aprovar — DIRECT.md: ação explícita do advogado obrigatória -->
                        @if (canApprove(petition)) {
                          <button type="button" class="btn-approve" (click)="openApprove(petition)">
                            ✓ Aprovar
                          </button>
                        }

                        <!-- Rejeitar com motivo — DIRECT.md: rastreabilidade obrigatória -->
                        @if (canReject(petition)) {
                          <button type="button" class="btn-danger" (click)="openReject(petition)">
                            Rejeitar
                          </button>
                        }

                        <button type="button" class="btn-danger" (click)="openDelete(petition)">Excluir</button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </article>
    </section>

    <!-- Modal de rejeição com motivo obrigatório -->
    @if (showRejectForm()) {
      <div class="dialog-overlay" (click)="closeReject()">
        <div class="dialog-box" (click)="$event.stopPropagation()">
          <h3 class="dialog-title">Rejeitar petição</h3>
          <p class="dialog-body">
            Informe o motivo da rejeição. Este registro é obrigatório para rastreabilidade conforme as diretrizes de governança.
          </p>
          <label style="margin-top:1rem; display:grid; gap:.4rem; color:#334155; font-weight:600;">
            Motivo da rejeição
            <textarea [(ngModel)]="rejectionReason" rows="4" placeholder="Descreva detalhadamente o motivo da rejeição..."></textarea>
          </label>
          <div class="dialog-actions" style="display:flex; gap:.75rem; justify-content:flex-end; margin-top:1.25rem;">
            <button type="button" class="btn-secondary" (click)="closeReject()">Cancelar</button>
            <button type="button" class="btn-danger" (click)="confirmReject()" [disabled]="rejectionReason.trim().length < 10">
              Confirmar rejeição
            </button>
          </div>
        </div>
      </div>
    }

    <lexia-confirm-dialog
      [visible]="dialog().visible"
      [title]="dialog().title"
      [message]="dialog().message"
      [confirmLabel]="dialog().confirmLabel"
      [confirmClass]="dialog().confirmClass"
      (confirmed)="executeAction()"
      (cancelled)="closeDialog()"
    />
  `,
})
export class PetitionListComponent implements OnInit {
  private readonly petitionService = inject(PetitionService);

  readonly petitions = signal<Petition[]>([]);
  readonly loading = signal(true);
  readonly errorMessage = signal('');
  readonly successMessage = signal('');
  readonly showRejectForm = signal(false);
  rejectionReason = '';

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
      action: 'approve',
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
    this.rejectionReason = '';
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
    this.rejectionReason = '';
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
    if (!target || this.rejectionReason.trim().length < 10) return;

    this.showRejectForm.set(false);
    this.petitionService.reject(target.id, { rejection_reason: this.rejectionReason.trim() }).subscribe({
      next: () => {
        this.successMessage.set('Petição rejeitada. Motivo registrado para rastreabilidade.');
        this.rejectionReason = '';
        this.loadPetitions();
      },
      error: (error: Error) => this.errorMessage.set(error.message),
    });
  }
}
