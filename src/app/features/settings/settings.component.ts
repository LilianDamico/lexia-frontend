import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'lexia-settings',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent {
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
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
    },
  );

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

    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    const { newPassword, confirmPassword } = this.passwordForm.getRawValue();

    if (newPassword !== confirmPassword) {
      this.passwordForm.controls.confirmPassword.setErrors({ mismatch: true });
      this.passwordError.set('As senhas não conferem.');
      return;
    }

    this.savingPassword.set(true);

    const { currentPassword } = this.passwordForm.getRawValue();

    this.authService.changePassword(currentPassword, newPassword).subscribe({
      next: () => {
        this.savingPassword.set(false);
        this.passwordSuccess.set('Senha alterada com sucesso!');
        this.passwordForm.reset();
        this.passwordSubmitted.set(false);
      },
      error: (error: Error) => {
        this.savingPassword.set(false);
        this.passwordError.set(error.message);
      },
    });
  }
}
