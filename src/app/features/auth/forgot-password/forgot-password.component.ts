import { Component, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'LEXIA-forgot-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <section class="auth-page">
      <article class="auth-card">
        <div>
          <h1>Esqueceu a senha?</h1>
          <p class="muted">Informe seu e-mail e enviaremos um link para redefinição.</p>
        </div>

        @if (success()) {
          <p class="alert alert-success">
            Se esse e-mail estiver cadastrado, você receberá as instruções em breve.
          </p>
          <a routerLink="/login" class="btn-primary" style="text-align:center">Voltar para o login</a>
        } @else {
          @if (errorMessage()) {
            <p class="alert alert-error">{{ errorMessage() }}</p>
          }

          <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
            <label>
              E-mail
              <input type="email" formControlName="email" autocomplete="email" placeholder="voce@escritorio.com" />
              @if (submitted() && form.controls.email.invalid) {
                <span class="field-error">Informe um e-mail válido.</span>
              }
            </label>

            <button type="submit" class="btn-primary" [disabled]="loading()">
              {{ loading() ? 'Enviando...' : 'Enviar link de redefinição' }}
            </button>
          </form>

          <p class="auth-link">
            Lembrou a senha? <a routerLink="/login">Voltar para o login</a>
          </p>
        }
      </article>
    </section>
  `,
})
export class ForgotPasswordComponent {
  private readonly fb = new FormBuilder();

  readonly loading = signal(false);
  readonly submitted = signal(false);
  readonly success = signal(false);
  readonly errorMessage = signal('');

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  submit(): void {
    this.submitted.set(true);
    this.errorMessage.set('');

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);

    // TODO: integrar com endpoint POST /api/v1/auth/forgot-password
    setTimeout(() => {
      this.loading.set(false);
      this.success.set(true);
    }, 800);
  }
}
