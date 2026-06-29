import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { LegalArea, LegalCase } from '../../../core/models/case.model';
import { Client } from '../../../core/models/client.model';
import { AuthService } from '../../../core/services/auth.service';
import { CaseService } from '../../../core/services/case.service';
import { ClientService } from '../../../core/services/client.service';
import { CaseFormComponent } from './case-form.component';

const mockClient: Client = {
  id: 'client-1',
  law_office_id: 'office-1',
  name: 'João Silva',
  document_number: null,
  email: null,
  phone: null,
  notes: null,
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
  is_active: true,
};

const mockLegalArea: LegalArea = { id: 'area-1', name: 'Trabalhista', area_type: 'labor' };

const mockCase: LegalCase = {
  id: 'case-1',
  law_office_id: 'office-1',
  client_id: 'client-1',
  legal_area_id: 'area-1',
  title: 'Caso Trabalhista',
  description: 'Descrição do caso',
  status: 'active',
  case_number: '0001234-56.2025.5.01.0000',
  court: 'TRT',
  facts_summary: 'Fatos relevantes',
  strategy_notes: 'Estratégia definida',
  ai_summary: null,
  risk_assessment: null,
  next_steps: null,
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-02T00:00:00Z',
  is_active: true,
};

describe('CaseFormComponent', () => {
  let component: CaseFormComponent;
  let fixture: ComponentFixture<CaseFormComponent>;
  let caseServiceSpy: jasmine.SpyObj<CaseService>;
  let clientServiceSpy: jasmine.SpyObj<ClientService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let router: Router;

  function setupComponent(routeParams: Record<string, string> = {}): void {
    TestBed.overrideProvider(ActivatedRoute, {
      useValue: { snapshot: { paramMap: convertToParamMap(routeParams) } },
    });
    fixture = TestBed.createComponent(CaseFormComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  }

  beforeEach(async () => {
    caseServiceSpy = jasmine.createSpyObj<CaseService>('CaseService', [
      'getLegalAreas', 'getById', 'create', 'update',
    ]);
    clientServiceSpy = jasmine.createSpyObj<ClientService>('ClientService', ['list']);
    authServiceSpy = jasmine.createSpyObj<AuthService>('AuthService', ['lawOfficeId']);

    caseServiceSpy.getLegalAreas.and.returnValue(of([mockLegalArea]));
    clientServiceSpy.list.and.returnValue(of([mockClient]));
    authServiceSpy.lawOfficeId.and.returnValue('office-1');

    await TestBed.configureTestingModule({
      imports: [CaseFormComponent],
      providers: [
        provideRouter([]),
        { provide: CaseService, useValue: caseServiceSpy },
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

    it('deve carregar clientes e áreas jurídicas no ngOnInit', () => {
      expect(clientServiceSpy.list).toHaveBeenCalledTimes(1);
      expect(caseServiceSpy.getLegalAreas).toHaveBeenCalledTimes(1);
      expect(component.clients()).toEqual([mockClient]);
      expect(component.legalAreas()).toEqual([mockLegalArea]);
    });

    it('deve ter formulário inválido quando campos obrigatórios estão vazios', () => {
      expect(component.form.invalid).toBeTrue();
    });

    it('deve ser válido com todos os campos obrigatórios preenchidos', () => {
      component.form.controls.title.setValue('Caso Teste');
      component.form.controls.client_id.setValue('client-1');
      component.form.controls.legal_area_id.setValue('area-1');
      expect(component.form.valid).toBeTrue();
    });

    it('não deve chamar create se o formulário for inválido', () => {
      component.save();
      expect(caseServiceSpy.create).not.toHaveBeenCalled();
      expect(component.submitted()).toBeTrue();
    });

    it('deve chamar CaseService.create com dados corretos e navegar para /cases', () => {
      const navigateSpy = spyOn(router, 'navigate').and.resolveTo(true);
      caseServiceSpy.create.and.returnValue(of(mockCase));
      component.form.controls.title.setValue('Caso Teste');
      component.form.controls.client_id.setValue('client-1');
      component.form.controls.legal_area_id.setValue('area-1');

      component.save();

      expect(caseServiceSpy.create).toHaveBeenCalledWith(
        jasmine.objectContaining({
          title: 'Caso Teste',
          client_id: 'client-1',
          legal_area_id: 'area-1',
          law_office_id: 'office-1',
        })
      );
      expect(navigateSpy).toHaveBeenCalledWith(['/cases']);
      expect(component.saving()).toBeFalse();
    });

    it('deve exibir mensagem de erro e desativar saving quando create falha', () => {
      caseServiceSpy.create.and.returnValue(throwError(() => new Error('Erro ao criar caso')));
      component.form.controls.title.setValue('Caso Teste');
      component.form.controls.client_id.setValue('client-1');
      component.form.controls.legal_area_id.setValue('area-1');

      component.save();

      expect(component.errorMessage()).toBe('Erro ao criar caso');
      expect(component.saving()).toBeFalse();
    });
  });

  describe('modo edição (com id na rota)', () => {
    beforeEach(() => {
      caseServiceSpy.getById.and.returnValue(of(mockCase));
      setupComponent({ id: 'case-1' });
    });

    it('deve criar o componente em modo edição', () => {
      expect(component).toBeTruthy();
      expect(component.isEditMode()).toBeTrue();
    });

    it('deve preencher o formulário com os dados do caso', () => {
      expect(component.form.controls.title.value).toBe('Caso Trabalhista');
      expect(component.form.controls.status.value).toBe('active');
      expect(component.form.controls.court.value).toBe('TRT');
      expect(component.form.controls.facts_summary.value).toBe('Fatos relevantes');
    });

    it('deve desabilitar os campos client_id e legal_area_id', () => {
      expect(component.form.controls.client_id.disabled).toBeTrue();
      expect(component.form.controls.legal_area_id.disabled).toBeTrue();
    });

    it('deve chamar CaseService.update com dados corretos e navegar para /cases', () => {
      const navigateSpy = spyOn(router, 'navigate').and.resolveTo(true);
      caseServiceSpy.update.and.returnValue(of(mockCase));
      component.form.controls.title.setValue('Caso Atualizado');

      component.save();

      expect(caseServiceSpy.update).toHaveBeenCalledWith(
        'case-1',
        jasmine.objectContaining({ title: 'Caso Atualizado', status: 'active' })
      );
      expect(navigateSpy).toHaveBeenCalledWith(['/cases']);
    });

    it('deve exibir mensagem de erro e desativar saving quando update falha', () => {
      caseServiceSpy.update.and.returnValue(throwError(() => new Error('Erro ao atualizar caso')));

      component.save();

      expect(component.errorMessage()).toBe('Erro ao atualizar caso');
      expect(component.saving()).toBeFalse();
    });
  });

  describe('erro ao carregar dados de suporte', () => {
    beforeEach(() => {
      clientServiceSpy.list.and.returnValue(throwError(() => new Error('Falha ao carregar clientes')));
      setupComponent();
    });

    it('deve exibir mensagem de erro quando loadSupportData falha', () => {
      expect(component.errorMessage()).toBe('Falha ao carregar clientes');
    });
  });

  describe('erro ao carregar caso no modo edição', () => {
    beforeEach(() => {
      caseServiceSpy.getById.and.returnValue(throwError(() => new Error('Caso não encontrado')));
      setupComponent({ id: 'id-invalido' });
    });

    it('deve exibir mensagem de erro e desativar loading', () => {
      expect(component.errorMessage()).toBe('Caso não encontrado');
      expect(component.loading()).toBeFalse();
    });
  });
});
