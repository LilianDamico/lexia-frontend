import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'lexia-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <section class="auth-page">
      <article class="auth-card">
        <div>
          <h1>Acessar a LexIA</h1>
          <p class="muted">Entre com seu usuário para operar o ambiente jurídico.</p>
        </div>

        @if (errorMessage()) {
          <p class="alert alert-error">{{ errorMessage() }}</p>
        }

        <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
          <label>
            E-mail
            <input type="email" formControlName="email" autocomplete="username" placeholder="voce@escritorio.com" />
            @if (submitted() && form.controls.email.invalid) {
              <span class="field-error">Informe um e-mail válido.</span>
            }
          </label>

          <label>
            Senha
            <input type="password" formControlName="password" autocomplete="current-password" placeholder="••••••••" />
            @if (submitted() && form.controls.password.invalid) {
              <span class="field-error">Informe a senha.</span>
            }
          </label>

          <button type="submit" class="btn-primary" [disabled]="loading()">
            {{ loading() ? 'Entrando...' : 'Entrar' }}
          </button>
        </form>
      </article>
    </section>
  `,
})
export class LoginComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly submitted = signal(false);
  readonly errorMessage = signal('');
  readonly form = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      void this.router.navigate(['/dashboard']);
    }
  }

  submit(): void {
    this.submitted.set(true);
    this.errorMessage.set('');

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.authService.login(this.form.getRawValue()).subscribe({
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
