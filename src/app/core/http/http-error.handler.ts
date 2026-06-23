import { MonoTypeOperatorFunction, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

/**
 * Operador reutilizável de tratamento de erros HTTP.
 * Padroniza mensagens em português e registra o erro original no console.
 */
export function handleHttpError<T>(action: string): MonoTypeOperatorFunction<T> {
  return catchError((error: unknown) => {
    console.error(`[LexIA] Erro ao ${action}.`, error);
    return throwError(() => new Error(`Não foi possível ${action}.`));
  });
}
