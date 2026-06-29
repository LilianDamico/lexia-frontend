import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { Client } from '../../../core/models/client.model';
import { ClientService } from '../../../core/services/client.service';
import { ClientListComponent } from './client-list.component';

const mockClient: Client = {
  id: 'client-1',
  law_office_id: 'office-1',
  name: 'João Silva',
  document_number: '123.456.789-00',
  email: 'joao@test.com',
  phone: '(11) 99999-0000',
  notes: null,
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-02T00:00:00Z',
  is_active: true,
};

describe('ClientListComponent', () => {
  let component: ClientListComponent;
  let fixture: ComponentFixture<ClientListComponent>;
  let clientServiceSpy: jasmine.SpyObj<ClientService>;

  beforeEach(async () => {
    clientServiceSpy = jasmine.createSpyObj<ClientService>('ClientService', ['list', 'delete']);
    clientServiceSpy.list.and.returnValue(of([mockClient]));

    await TestBed.configureTestingModule({
      imports: [ClientListComponent],
      providers: [
        provideRouter([]),
        { provide: ClientService, useValue: clientServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ClientListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  describe('carregamento da lista', () => {
    it('deve chamar ClientService.list no ngOnInit', () => {
      expect(clientServiceSpy.list).toHaveBeenCalledTimes(1);
    });

    it('deve popular a lista após carregamento bem-sucedido', () => {
      expect(component.clients()).toEqual([mockClient]);
      expect(component.loading()).toBeFalse();
    });

    it('deve exibir mensagem de erro quando o carregamento falha', () => {
      clientServiceSpy.list.and.returnValue(throwError(() => new Error('Falha ao carregar clientes')));
      component.loadClients();
      expect(component.errorMessage()).toBe('Falha ao carregar clientes');
      expect(component.loading()).toBeFalse();
    });

    it('deve limpar errorMessage ao recarregar', () => {
      component.errorMessage.set('Erro anterior');
      clientServiceSpy.list.and.returnValue(of([mockClient]));
      component.loadClients();
      expect(component.errorMessage()).toBe('');
    });
  });

  describe('exclusão de cliente', () => {
    it('deve definir confirmTarget ao abrir modal de exclusão', () => {
      component.openDelete(mockClient);
      expect(component.confirmTarget()).toEqual(mockClient);
    });

    it('não deve chamar delete se confirmTarget for nulo', () => {
      component.confirmTarget.set(null);
      component.deleteConfirmed();
      expect(clientServiceSpy.delete).not.toHaveBeenCalled();
    });

    it('deve chamar ClientService.delete com o id correto ao confirmar', () => {
      clientServiceSpy.delete.and.returnValue(of(undefined));
      clientServiceSpy.list.and.returnValue(of([]));
      component.confirmTarget.set(mockClient);

      component.deleteConfirmed();

      expect(clientServiceSpy.delete).toHaveBeenCalledWith('client-1');
    });

    it('deve limpar confirmTarget e recarregar lista após exclusão bem-sucedida', () => {
      clientServiceSpy.delete.and.returnValue(of(undefined));
      clientServiceSpy.list.and.returnValue(of([]));
      component.confirmTarget.set(mockClient);

      component.deleteConfirmed();

      expect(component.confirmTarget()).toBeNull();
      expect(clientServiceSpy.list).toHaveBeenCalledTimes(2);
    });

    it('deve exibir mensagem de erro se a exclusão falhar', () => {
      clientServiceSpy.delete.and.returnValue(throwError(() => new Error('Erro ao excluir cliente')));
      component.confirmTarget.set(mockClient);

      component.deleteConfirmed();

      expect(component.errorMessage()).toBe('Erro ao excluir cliente');
    });
  });
});
