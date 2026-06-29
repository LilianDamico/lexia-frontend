import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { LegalCase } from '../../../core/models/case.model';
import { CaseService } from '../../../core/services/case.service';
import { CaseListComponent } from './case-list.component';

const mockCase: LegalCase = {
  id: 'case-1',
  law_office_id: 'office-1',
  client_id: 'client-1',
  legal_area_id: 'area-1',
  title: 'Caso Trabalhista',
  description: null,
  status: 'active',
  case_number: '0001234-56.2025.5.01.0000',
  court: 'TRT',
  facts_summary: null,
  strategy_notes: null,
  ai_summary: null,
  risk_assessment: null,
  next_steps: null,
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-02T00:00:00Z',
  is_active: true,
};

describe('CaseListComponent', () => {
  let component: CaseListComponent;
  let fixture: ComponentFixture<CaseListComponent>;
  let caseServiceSpy: jasmine.SpyObj<CaseService>;

  beforeEach(async () => {
    caseServiceSpy = jasmine.createSpyObj<CaseService>('CaseService', ['list', 'delete']);
    caseServiceSpy.list.and.returnValue(of([mockCase]));

    await TestBed.configureTestingModule({
      imports: [CaseListComponent],
      providers: [
        provideRouter([]),
        { provide: CaseService, useValue: caseServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CaseListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  describe('carregamento da lista', () => {
    it('deve chamar CaseService.list no ngOnInit', () => {
      expect(caseServiceSpy.list).toHaveBeenCalledTimes(1);
    });

    it('deve popular a lista após carregamento bem-sucedido', () => {
      expect(component.cases()).toEqual([mockCase]);
      expect(component.loading()).toBeFalse();
    });

    it('deve exibir mensagem de erro quando o carregamento falha', () => {
      caseServiceSpy.list.and.returnValue(throwError(() => new Error('Falha na conexão')));
      component.loadCases();
      expect(component.errorMessage()).toBe('Falha na conexão');
      expect(component.loading()).toBeFalse();
    });

    it('deve limpar errorMessage ao recarregar', () => {
      component.errorMessage.set('Erro anterior');
      caseServiceSpy.list.and.returnValue(of([mockCase]));
      component.loadCases();
      expect(component.errorMessage()).toBe('');
    });
  });

  describe('exclusão de caso', () => {
    it('deve definir confirmTarget ao abrir modal de exclusão', () => {
      component.openDelete(mockCase);
      expect(component.confirmTarget()).toEqual(mockCase);
    });

    it('não deve chamar delete se confirmTarget for nulo', () => {
      component.confirmTarget.set(null);
      component.deleteConfirmed();
      expect(caseServiceSpy.delete).not.toHaveBeenCalled();
    });

    it('deve chamar CaseService.delete com o id correto ao confirmar', () => {
      caseServiceSpy.delete.and.returnValue(of(undefined));
      caseServiceSpy.list.and.returnValue(of([]));
      component.confirmTarget.set(mockCase);

      component.deleteConfirmed();

      expect(caseServiceSpy.delete).toHaveBeenCalledWith('case-1');
    });

    it('deve limpar confirmTarget e recarregar lista após exclusão bem-sucedida', () => {
      caseServiceSpy.delete.and.returnValue(of(undefined));
      caseServiceSpy.list.and.returnValue(of([]));
      component.confirmTarget.set(mockCase);

      component.deleteConfirmed();

      expect(component.confirmTarget()).toBeNull();
      expect(caseServiceSpy.list).toHaveBeenCalledTimes(2);
    });

    it('deve exibir mensagem de erro se a exclusão falhar', () => {
      caseServiceSpy.delete.and.returnValue(throwError(() => new Error('Erro ao excluir caso')));
      component.confirmTarget.set(mockCase);

      component.deleteConfirmed();

      expect(component.errorMessage()).toBe('Erro ao excluir caso');
    });
  });
});
