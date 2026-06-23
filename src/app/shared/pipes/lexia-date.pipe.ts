import { DatePipe } from '@angular/common';
import { inject, Pipe, PipeTransform } from '@angular/core';

/** Formata datas ISO para pt-BR. Centraliza a formatação de datas em toda a aplicação. */
@Pipe({ name: 'lexiaDate', standalone: true, pure: true })
export class LexIADatePipe implements PipeTransform {
  private readonly datePipe = inject(DatePipe, { optional: true }) ?? new DatePipe('pt-BR');

  transform(value: string | null | undefined, format = 'dd/MM/yyyy HH:mm'): string {
    if (!value) return '—';
    return this.datePipe.transform(value, format, undefined, 'pt-BR') ?? '—';
  }
}
