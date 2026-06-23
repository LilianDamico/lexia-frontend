import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ClientCreate, ClientUpdate } from '../../../core/models/client.model';
import { AuthService } from '../../../core/services/auth.service';
import { ClientService } from '../../../core/services/client.service';
import { toNullable } from '../../../shared/utils/form.utils';

@Component({
  selector: 'lexia-client-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <section class="page">
      <header class="page-header">
        <div>
          <h2>{{ isEditMode() ? 'Editar cliente' : 'Novo cliente' }}</h2>
          <p>Cadastre dados essenciais para relacionamento jurÃ­dico e operacional.</p>
        </div>
        <a class="btn-secondary" routerLink="/clients">Voltar</a>
      </header>

      @if (errorMessage()) {
        <p class="alert alert-error">{{ errorMessage() }}</p>
      }

      <article class="card">
        @if (loading()) {
          <p>Carregando formulÃ¡rio...</p>
        } @else {
          <form class="form-stack" [formGroup]="form" (ngSubmit)="save()" novalidate>
            <div class="form-grid">
              <label>
                Nome
                <input type="text" formControlName="name" placeholder="Nome completo ou razÃ£o social" />
                @if (submitted() && form.controls.name.invalid) {
                  <span class="field-error">Informe o nome do cliente.</span>
                }
              </label>

              <label>
                Documento
                <input type="text" formControlName="document_number" placeholder="CPF, CNPJ ou outro identificador" />
              </label>

              <label>
                E-mail
                <input type="email" formControlName="email" placeholder="cliente@dominio.com" />
                @if (form.controls.email.touched && form.controls.email.invalid) {
                  <span class="field-error">Informe um e-mail vÃ¡lido.</span>
                }
              </label>

              <label>
                Telefone
                <input type="text" formControlName="phone" placeholder="(00) 00000-0000" />
              </label>

              <label class="full-width">
                ObservaÃ§Ãµes
                <textarea formControlName="notes" placeholder="AnotaÃ§Ãµes relevantes sobre o cliente"></textarea>
              </label>
            </div>

            <div class="actions">
              <button type="submit" class="btn-primary" [disabled]="saving()">
                {{ saving() ? 'Salvando...' : 'Salvar cliente' }}
              </button>
              <a class="btn-secondary" routerLink="/clients">Cancelar</a>
            </div>
          </form>
        }
      </article>
    </section>
  `,
})
export class ClientFormComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly clientService = inject(ClientService);
  private readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly isEditMode = signal(false);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly submitted = signal(false);
  readonly errorMessage = signal('');
  readonly form = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required]],
    document_number: [''],
    email: ['', [Validators.email]],
    phone: [''],
    notes: [''],
  });

  private clientId = '';

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    this.isEditMode.set(true);
    this.clientId = id;
    this.loading.set(true);
    this.clientService.getById(id).subscribe({
      next: (client) => {
        this.form.patchValue({
          name: client.name,
          document_number: client.document_number ?? '',
          email: client.email ?? '',
          phone: client.phone ?? '',
          notes: client.notes ?? '',
        });
        this.loading.set(false);
      },
      error: (error: Error) => {
        this.loading.set(false);
        this.errorMessage.set(error.message);
      },
    });
  }

  save(): void {
    this.submitted.set(true);
    this.errorMessage.set('');

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    const values = this.form.getRawValue();

    if (this.isEditMode()) {
      const payload: ClientUpdate = {
        name: values.name,
        document_number: toNullable(values.document_number),
        email: toNullable(values.email),
        phone: toNullable(values.phone),
        notes: toNullable(values.notes),
      };

      this.clientService.update(this.clientId, payload).subscribe({
        next: () => { this.saving.set(false); void this.router.navigate(['/clients']); },
        error: (error: Error) => { this.saving.set(false); this.errorMessage.set(error.message); },
      });
      return;
    }

    const payload: ClientCreate = {
      law_office_id: this.authService.lawOfficeId(),
      name: values.name,
      document_number: toNullable(values.document_number),
      email: toNullable(values.email),
      phone: toNullable(values.phone),
      notes: toNullable(values.notes),
    };

    this.clientService.create(payload).subscribe({
      next: () => { this.saving.set(false); void this.router.navigate(['/clients']); },
      error: (error: Error) => { this.saving.set(false); this.errorMessage.set(error.message); },
    });
  }
}
