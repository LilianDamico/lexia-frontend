import { Component, EventEmitter, Input, Output } from '@angular/core';

/**
 * Modal de confirmação para ações destrutivas ou críticas.
 * Substitui window.confirm() que não é testável e não segue o design system.
 * DIRECT.md: toda ação crítica depende de confirmação explícita do advogado.
 */
@Component({
  selector: 'lexia-confirm-dialog',
  standalone: true,
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.css'
})
export class ConfirmDialogComponent {
  @Input() visible = false;
  @Input() title = 'Confirmar ação';
  @Input() message = 'Deseja prosseguir com esta operação?';
  @Input() detail = '';
  @Input() confirmLabel = 'Confirmar';
  @Input() confirmClass = 'btn-danger';

  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  confirm(): void {
    this.confirmed.emit();
  }

  cancel(): void {
    this.cancelled.emit();
  }
}
