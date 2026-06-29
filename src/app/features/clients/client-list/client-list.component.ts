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
  templateUrl: './client-list.component.html',
  styleUrl: './client-list.component.css'
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
