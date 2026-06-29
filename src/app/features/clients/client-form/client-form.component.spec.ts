import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { Client } from '../../../core/models/client.model';
import { AuthService } from '../../../core/services/auth.service';
import { ClientService } from '../../../core/services/client.service';
import { ClientFormComponent } from './client-form.component';

const mockClient: Client = {
  id: 'client-1',
  law_office_id: 'office-1',
  name: 'João Silva',
  document_number: '123.456.789-00',
  email: 'joao@test.com',
  phone: '(11) 99999-0000',
  notes: 'Notas de teste',
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-02T00:00:00Z',
  is_active: true,
};

describe('ClientFormComponent', () => {
  let component: ClientFormComponent;
  let fixture: ComponentFixture<ClientFormComponent>;
  let clientServiceSpy: jasmine.SpyObj<ClientService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let router: Router;

  function setupComponent(routeParams: Record<string, string> = {}): void {
    TestBed.overrideProvider(ActivatedRoute, {
      useValue: { snapshot: { paramMap: convertToParamMap(routeParams) } },
    });
    fixture = TestBed.createComponent(ClientFormComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  }

  beforeEach(async () => {
    clientServiceSpy = jasmine.createSpyObj<ClientService>('ClientService', ['getById', 'create', 'update']);
    authServiceSpy = jasmine.createSpyObj<AuthService>('AuthService', ['lawOfficeId']);
    authServiceSpy.lawOfficeId.and.returnValue('office-1');

    await TestBed.configureTestingModule({
      imports: [ClientFormComponent],
      providers: [
        provideRouter([]),
        { provide: ClientService, useValue: clientServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
      ],
    }).compileComponents();
  });

  describe('modo criação (sem id na rota)', () => {
    beforeEach(() => setupComponent());

    it('deve criar o componente', () => {
      expect(component).toBeTruthy();
    });

    it('deve iniciar no modo criação', () => {
      expect(component.isEditMode()).toBeFalse();
    });

    it('deve ter formulário inválido quando o nome está vazio', () => {
      expect(component.form.invalid).toBeTrue();
    });

    it('deve ser inválido com e-mail malformado', () => {
      component.form.controls.name.setValue('João Silva');
      component.form.controls.email.setValue('email-invalido');
      expect(component.form.invalid).toBeTrue();
    });

    it('deve ser válido preenchendo apenas o nome (campo obrigatório)', () => {
      component.form.controls.name.setValue('João Silva');
      expect(component.form.valid).toBeTrue();
    });

    it('não deve chamar create se o formulário for inválido', () => {
      component.save();
      expect(clientServiceSpy.create).not.toHaveBeenCalled();
      expect(component.submitted()).toBeTrue();
    });

    it('deve chamar ClientService.create com dados corretos e navegar para /clients', () => {
      const navigateSpy = spyOn(router, 'navigate').and.resolveTo(true);
      clientServiceSpy.create.and.returnValue(of(mockClient));
      component.form.controls.name.setValue('João Silva');
      component.form.controls.email.setValue('joao@test.com');

      component.save();

      expect(clientServiceSpy.create).toHaveBeenCalledWith(
        jasmine.objectContaining({ name: 'João Silva', law_office_id: 'office-1' })
      );
      expect(navigateSpy).toHaveBeenCalledWith(['/clients']);
      expect(component.saving()).toBeFalse();
    });

    it('deve exibir mensagem de erro e desativar saving quando create falha', () => {
      clientServiceSpy.create.and.returnValue(throwError(() => new Error('Erro ao criar cliente')));
      component.form.controls.name.setValue('João Silva');

      component.save();

      expect(component.errorMessage()).toBe('Erro ao criar cliente');
      expect(component.saving()).toBeFalse();
    });
  });

  describe('modo edição (com id na rota)', () => {
    beforeEach(() => {
      clientServiceSpy.getById.and.returnValue(of(mockClient));
      setupComponent({ id: 'client-1' });
    });

    it('deve criar o componente em modo edição', () => {
      expect(component).toBeTruthy();
      expect(component.isEditMode()).toBeTrue();
    });

    it('deve preencher o formulário com os dados do cliente', () => {
      expect(component.form.controls.name.value).toBe('João Silva');
      expect(component.form.controls.email.value).toBe('joao@test.com');
      expect(component.form.controls.phone.value).toBe('(11) 99999-0000');
      expect(component.form.controls.notes.value).toBe('Notas de teste');
    });

    it('deve chamar ClientService.update com dados corretos e navegar para /clients', () => {
      const navigateSpy = spyOn(router, 'navigate').and.resolveTo(true);
      clientServiceSpy.update.and.returnValue(of(mockClient));
      component.form.controls.name.setValue('João Silva Atualizado');

      component.save();

      expect(clientServiceSpy.update).toHaveBeenCalledWith(
        'client-1',
        jasmine.objectContaining({ name: 'João Silva Atualizado' })
      );
      expect(navigateSpy).toHaveBeenCalledWith(['/clients']);
    });

    it('deve exibir mensagem de erro e desativar saving quando update falha', () => {
      clientServiceSpy.update.and.returnValue(throwError(() => new Error('Erro ao atualizar cliente')));

      component.save();

      expect(component.errorMessage()).toBe('Erro ao atualizar cliente');
      expect(component.saving()).toBeFalse();
    });
  });

  describe('erro ao carregar dados no modo edição', () => {
    beforeEach(() => {
      clientServiceSpy.getById.and.returnValue(throwError(() => new Error('Cliente não encontrado')));
      setupComponent({ id: 'id-invalido' });
    });

    it('deve exibir mensagem de erro e desativar loading', () => {
      expect(component.errorMessage()).toBe('Cliente não encontrado');
      expect(component.loading()).toBeFalse();
    });
  });
});
