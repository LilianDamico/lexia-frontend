import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Client } from '../../../core/models/client.model';
import { ClientService } from '../../../core/services/client.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { LexIADatePipe } from '../../../shared/pipes/lexia-date.pipe';

@Component({
  selector: 'lexia-client-list',
  standalone: true,
  imports: [RouterLink, ConfirmDialogComponent, LexIADatePipe],
  template: `
    <section class="page">
      <header class="page-header">
        <div>
          <h2>Clientes</h2>
          <p>Gerencie a base de clientes do escritório.</p>
        </div>
        <div class="actions">
          <button type="button" class="btn-secondary" (click)="loadClients()" [disabled]="loading()">Atualizar</button>
          <a class="btn-primary" routerLink="/clients/new">Novo cliente</a>
        </div>
      </header>

      @if (errorMessage()) {
        <p class="alert alert-error">{{ errorMessage() }}</p>
      }

      <article class="card">
        @if (loading()) {
          <p>Carregando clientes...</p>
        } @else if (!clients().length) {
          <div class="empty-state">
            <h3>Nenhum cliente cadastrado</h3>
            <p>Crie o primeiro cliente para iniciar a operação.</p>
          </div>
        } @else {
          <div class="table-wrapper">
            <table class="table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Documento</th>
                  <th>E-mail</th>
                  <th>Telefone</th>
                  <th>Atualizado em</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                @for (client of clients(); track client.id) {
                  <tr>
                    <td>{{ client.name }}</td>
                    <td>{{ client.document_number || '—' }}</td>
                    <td>{{ client.email || '—' }}</td>
                    <td>{{ client.phone || '—' }}</td>
                    <td>{{ client.updated_at | lexiaDate }}</td>
                    <td>
                      <div class="inline-actions">
                        <a class="btn-secondary" [routerLink]="['/clients', client.id, 'edit']">Editar</a>
                        <button type="button" class="btn-danger" (click)="openDelete(client)">Excluir</button>
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

    <lexia-confirm-dialog
      [visible]="confirmTarget() !== null"
      title="Excluir cliente"
      [message]="'Deseja excluir o cliente ' + (confirmTarget()?.name ?? '') + '? Esta ação não pode ser desfeita.'"
      confirmLabel="Excluir"
      (confirmed)="deleteConfirmed()"
      (cancelled)="confirmTarget.set(null)"
    />
  `,
})
export class ClientListComponent implements OnInit {
  private readonly clientService = inject(ClientService);

  readonly clients = signal<Client[]>([]);
  readonly loading = signal(true);
  readonly errorMessage = signal('');
  readonly confirmTarget = signal<Client | null>(null);

  ngOnInit(): void {
    this.loadClients();
  }

  loadClients(): void {
    this.loading.set(true);
    this.errorMessage.set('');
    this.clientService.list().subscribe({
      next: (clients) => {
        this.clients.set(clients);
        this.loading.set(false);
      },
      error: (error: Error) => {
        this.loading.set(false);
        this.errorMessage.set(error.message);
      },
    });
  }

  openDelete(client: Client): void {
    this.confirmTarget.set(client);
  }

  deleteConfirmed(): void {
    const target = this.confirmTarget();
    this.confirmTarget.set(null);
    if (!target) return;

    this.clientService.delete(target.id).subscribe({
      next: () => this.loadClients(),
      error: (error: Error) => this.errorMessage.set(error.message),
    });
  }
}
