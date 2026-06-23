import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'lexia-settings',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <section class="page">
      <header class="page-header">
        <div>
          <h2>Configurações</h2>
          <p>Gerencie seu perfil e preferências da conta.</p>
        </div>
      </header>

      <!-- Perfil -->
      <article class="card">
        <h3>Informações do perfil</h3>

        @if (profileSuccess()) {
          <p class="alert alert-success">{{ profileSuccess() }}</p>
        }
        @if (profileError()) {
          <p class="alert alert-error">{{ profileError() }}</p>
        }

        <div class="form-grid">
          <div>
            <strong>E-mail</strong>
            <p>{{ currentUser()?.email ?? '—' }}</p>
          </div>
          <div>
            <strong>Perfil / Role</strong>
            <p>{{ roleLabel(currentUser()?.role) }}</p>
          </div>
          <div>
            <strong>Escritório</strong>
            <p class="text-muted">{{ currentUser()?.lawOfficeId ?? '—' }}</p>
          </div>
        </div>
      </article>

      <!-- Alterar senha -->
      <article class="card">
        <h3>Alterar senha</h3>

        @if (passwordSuccess()) {
          <p class="alert alert-success">{{ passwordSuccess() }}</p>
        }
        @if (passwordError()) {
          <p class="alert alert-error">{{ passwordError() }}</p>
        }

        <form class="form-stack" [formGroup]="passwordForm" (ngSubmit)="changePassword()" novalidate>
          <div class="form-grid">
            <label>
              Nova senha
              <input type="password" formControlName="newPassword" placeholder="Mínimo 8 caracteres" autocomplete="new-password" />
              @if (passwordSubmitted() && passwordForm.controls.newPassword.invalid) {
                <span class="field-error">A senha deve ter no mínimo 8 caracteres.</span>
              }
            </label>

            <label>
              Confirmar nova senha
              <input type="password" formControlName="confirmPassword" placeholder="Repita a nova senha" autocomplete="new-password" />
              @if (passwordSubmitted() && passwordForm.controls.confirmPassword.invalid) {
                <span class="field-error">As senhas não conferem.</span>
              }
            </label>
          </div>

          <div class="actions">
            <button type="submit" class="btn-primary" [disabled]="savingPassword()">
              {{ savingPassword() ? 'Salvando...' : 'Alterar senha' }}
            </button>
          </div>
        </form>
      </article>

      <!-- Notificações -->
      <article class="card">
        <h3>Notificações</h3>
        <p class="text-muted">
          Alertas de prazo são enviados automaticamente por e-mail conforme configurações do escritório.
          Para ajustar o endereço de e-mail de notificações, entre em contato com o administrador do escritório.
        </p>
      </article>

      <!-- Sobre o sistema -->
      <article class="card">
        <h3>Sobre o LexIA</h3>
        <div class="form-grid">
          <div>
            <strong>Versão</strong>
            <p>LexIA 0.1.0</p>
          </div>
          <div>
            <strong>Governança da IA</strong>
            <p class="text-muted">A IA auxilia, nunca decide. Toda ação crítica requer confirmação humana explícita.</p>
          </div>
        </div>
      </article>
    </section>
  `,
  styles: [`
    .text-muted { color: var(--color-neutral-500, #6b7280); font-size: 0.9rem; }
  `],
})
export class SettingsComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly formBuilder = inject(FormBuilder);

  readonly currentUser = this.authService.user;
  readonly profileSuccess = signal('');
  readonly profileError = signal('');
  readonly passwordSuccess = signal('');
  readonly passwordError = signal('');
  readonly passwordSubmitted = signal(false);
  readonly savingPassword = signal(false);

  readonly passwordForm = this.formBuilder.nonNullable.group(
    {
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
    },
  );

  ngOnInit(): void {
    // Reservado para carregar preferências do perfil via API no futuro.
  }

  roleLabel(role: string | undefined): string {
    const labels: Record<string, string> = {
      admin: 'Administrador',
      lawyer: 'Advogado',
      assistant: 'Assistente',
      viewer: 'Visualizador',
    };
    return role ? (labels[role] ?? role) : '—';
  }

  changePassword(): void {
    this.passwordSubmitted.set(true);
    this.passwordError.set('');
    this.passwordSuccess.set('');

    const { newPassword, confirmPassword } = this.passwordForm.getRawValue();

    if (this.passwordForm.controls.newPassword.invalid) {
      return;
    }

    if (newPassword !== confirmPassword) {
      this.passwordForm.controls.confirmPassword.setErrors({ mismatch: true });
      this.passwordError.set('As senhas não conferem.');
      return;
    }

    // A chamada real ao backend será implementada quando o endpoint PUT /users/me estiver disponível.
    // Por ora exibe mensagem de orientação.
    this.passwordError.set(
      'Para alterar a senha, solicite ao administrador do escritório via Administração > Usuários.',
    );
  }
}
