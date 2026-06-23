import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

const passwordMatchValidator: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
  const password = group.get('password')?.value as string;
  const confirm = group.get('confirmPassword')?.value as string;
  return password && confirm && password !== confirm ? { passwordMismatch: true } : null;
};

@Component({
  selector: 'LEXIA-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <section class="auth-page">
      <article class="auth-card">
        <div>
          <h1>Criar conta</h1>
          <p class="muted">Comece agora — seu escritório estará pronto em instantes.</p>
        </div>

        @if (errorMessage()) {
          <p class="alert alert-error">{{ errorMessage() }}</p>
        }

        <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
          <div class="form-grid">
            <label class="full-width">
              Nome completo
              <input type="text" formControlName="full_name" autocomplete="name" placeholder="Maria da Silva" />
              @if (submitted() && form.controls.full_name.invalid) {
                <span class="field-error">Informe seu nome completo (mínimo 3 caracteres).</span>
              }
            </label>

            <label class="full-width">
              Nome do escritório
              <input type="text" formControlName="office_name" placeholder="Silva & Associados Advocacia" />
              @if (submitted() && form.controls.office_name.invalid) {
                <span class="field-error">Informe o nome do escritório.</span>
              }
            </label>

            <label class="full-width">
              E-mail profissional
              <input type="email" formControlName="email" autocomplete="email" placeholder="voce@escritorio.com" />
              @if (submitted() && form.controls.email.invalid) {
                <span class="field-error">Informe um e-mail válido.</span>
              }
            </label>

            <label>
              Senha
              <input type="password" formControlName="password" autocomplete="new-password" placeholder="Mínimo 8 caracteres" />
              @if (submitted() && form.controls.password.invalid) {
                <span class="field-error">A senha deve ter pelo menos 8 caracteres.</span>
              }
            </label>

            <label>
              Confirmar senha
              <input type="password" formControlName="confirmPassword" autocomplete="new-password" placeholder="Repita a senha" />
              @if (submitted() && form.hasError('passwordMismatch')) {
                <span class="field-error">As senhas não coincidem.</span>
              }
            </label>
          </div>

          <button type="submit" class="btn-primary" [disabled]="loading()">
            {{ loading() ? 'Criando conta...' : 'Criar conta' }}
          </button>
        </form>

        <p class="auth-link" style="text-align:center">
          Já tem uma conta? <a routerLink="/login">Fazer login</a>
        </p>
      </article>
    </section>
  `,
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly submitted = signal(false);
  readonly errorMessage = signal('');

  readonly form = this.fb.nonNullable.group(
    {
      full_name: ['', [Validators.required, Validators.minLength(3)]],
      office_name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
    },
    { validators: passwordMatchValidator },
  );

  submit(): void {
    this.submitted.set(true);
    this.errorMessage.set('');

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const { full_name, email, password, office_name } = this.form.getRawValue();

    this.authService.register({ full_name, email, password, office_name }).subscribe({
      next: () => {
        this.loading.set(false);
        void this.router.navigate(['/dashboard']);
      },
      error: (error: Error) => {
        this.loading.set(false);
        this.errorMessage.set(error.message);
      },
    });
  }
}
