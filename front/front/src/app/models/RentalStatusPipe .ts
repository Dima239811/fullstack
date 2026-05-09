import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'rentalStatus'
})
export class RentalStatusPipe implements PipeTransform {
  private statusMap: Record<string, string> = {
    'PENDING': 'Ожидает подтверждения',
    'CONFIRMED': 'Подтверждена',
    'ACTIVE': 'В процессе',
    'COMPLETED': 'Завершена',
    'CANCELLED': 'Отменена'
  };

  transform(value: string): string {
    return this.statusMap[value] || value;
  }
}
