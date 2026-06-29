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
  templateUrl: './client-form.component.html',
  styleUrl: './client-form.component.css'
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
