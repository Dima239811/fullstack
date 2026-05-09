import { Component, OnInit, signal,computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClientService } from '../../services/client.service';
import { ClientProfileResponse } from '../../models/user-profile.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-clients',
  imports: [CommonModule],
  templateUrl: './clients.html',
  styleUrl: './clients.scss',
})
export class Clients implements OnInit{
  clients = signal<ClientProfileResponse[]>([]);
  isLoading = signal(false);

  constructor(
    private clientService: ClientService,
     private router: Router
    ) {}

  ngOnInit() {
    this.loadClients();
  }

  loadClients() {
    this.isLoading.set(true);

    this.clientService.getAll().subscribe({
      next: (clients) => {
        this.clients.set(clients);
        this.page.set(1);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.isLoading.set(false);
      }
    });
  }

  editClient(login: string) {
    // Здесь логика перехода на страницу редактирования клиента
    console.log('Редактирование клиента с login:', login);
    // Например, перенаправление на маршрут /clients/edit/:login
  }

  deleteClient(login: string) {
    if (confirm('Вы уверены, что хотите удалить этого клиента?')) {
      this.clientService.deleteClient(login).subscribe({
        next: () => {
          this.loadClients();
        },
        error: (err) => {
          if (err.status === 400) {
            alert("У клиента есть активные бронирования, удалите их перед удалением клиента.");
          } else {
            alert("У клиента есть активные бронирования, удалите их перед удалением клиента.");
          }
        }
      });
    }
  }
  page = signal(1);
  pageSize = 5;

  paginatedClients = computed(() => {
    const start = (this.page() - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.clients().slice(start, end);
  });

  totalPages = computed(() => {
    return Math.max(1, Math.ceil(this.clients().length / this.pageSize));
  });

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages()) {
      return;
    }

    this.page.set(page);
  }

  goHome() {
    this.router.navigate(['/home']);
  }
}
