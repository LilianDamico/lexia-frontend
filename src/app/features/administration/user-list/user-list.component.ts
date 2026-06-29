import { Component, inject, OnInit, signal } from '@angular/core';
import { AdministrationService, UserAdmin } from '../administration.service';
import { LexIADatePipe } from '../../../shared/pipes/lexia-date.pipe';

@Component({
  selector: 'lexia-user-list',
  standalone: true,
  imports: [LexIADatePipe],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.css'
})
export class UserListComponent implements OnInit {
  private readonly administrationService = inject(AdministrationService);

  readonly users = signal<UserAdmin[]>([]);
  readonly loading = signal(true);
  readonly errorMessage = signal('');

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading.set(true);
    this.errorMessage.set('');
    this.administrationService.listUsers().subscribe({
      next: (users) => {
        this.users.set(users);
        this.loading.set(false);
      },
      error: (error: Error) => {
        this.loading.set(false);
        this.errorMessage.set(error.message);
      },
    });
  }

  roleLabel(role: UserAdmin['role']): string {
    const labels: Record<UserAdmin['role'], string> = {
      admin: 'Administrador',
      lawyer: 'Advogado',
      assistant: 'Assistente',
      viewer: 'Leitura',
    };
    return labels[role];
  }
}
