import { Component, EventEmitter, Input, Output } from '@angular/core';

/**
 * Modal de confirmação para ações destrutivas ou críticas.
 * Substitui window.confirm() que não é testável e não segue o design system.
 * DIRECT.md: toda ação crítica depende de confirmação explícita do advogado.
 */
@Component({
  selector: 'lexia-confirm-dialog',
  standalone: true,
  template: `
    @if (visible) {
      <div class="dialog-overlay" (click)="cancel()">
        <div class="dialog-box" (click)="$event.stopPropagation()">
          <h3 class="dialog-title">{{ title }}</h3>
          <p class="dialog-body">{{ message }}</p>
          @if (detail) {
            <p class="dialog-detail">{{ detail }}</p>
          }
          <div class="dialog-actions">
            <button type="button" class="btn-secondary" (click)="cancel()">Cancelar</button>
            <button type="button" [class]="confirmClass" (click)="confirm()">{{ confirmLabel }}</button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .dialog-overlay {
      position: fixed;
      inset: 0;
      background: rgba(23, 32, 51, 0.55);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      backdrop-filter: blur(2px);
    }
    .dialog-box {
      background: #fff;
      border-radius: 16px;
      padding: 2rem;
      max-width: 420px;
      width: 90%;
      box-shadow: 0 8px 32px rgba(23,32,51,0.18);
    }
    .dialog-title {
      margin: 0 0 0.5rem;
      font-size: 1.1rem;
      color: #172033;
    }
    .dialog-body {
      margin: 0 0 0.25rem;
      color: #4a5568;
      line-height: 1.5;
    }
    .dialog-detail {
      margin: 0 0 1.25rem;
      color: #718096;
      font-size: 0.875rem;
    }
    .dialog-actions {
      display: flex;
      gap: 0.75rem;
      justify-content: flex-end;
      margin-top: 1.5rem;
    }
  `],
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
