/**
 * Converte string vazia em null para envio à API.
 * Campos opcionais devem ser null (não string vazia) conforme contrato backend.
 */
export function toNullable(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}
