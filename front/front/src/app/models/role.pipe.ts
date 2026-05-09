import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'role',
  standalone: true
})
export class RolePipe implements PipeTransform {
  private readonly roleMap: { [key in string]: string } = {
    CLIENT: 'Клиент',
    ADMIN: 'Администратор',
    MANAGER: 'Менеджер'
  };

  transform(value: string | null | undefined): string {
    if (!value) {
      return 'Неизвестно';
    }

    return this.roleMap[value] || value;
  }
}
