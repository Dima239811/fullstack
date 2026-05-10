import { Component, OnInit, signal,computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClientService } from '../../services/client.service';
import { ClientProfileResponse } from '../../models/user-profile.model';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { UserService } from '../../services/user.service';
import{FormsModule} from '@angular/forms';

@Component({
  selector: 'app-clients',
  imports: [CommonModule,FormsModule],
  templateUrl: './clients.html',
  styleUrl: './clients.scss',
})
export class Clients implements OnInit{
  clients = signal<ClientProfileResponse[]>([]);
  isLoading = signal(false);

  isAdmin = computed(() => {
    return this.authService.currentUser()?.role === 'ADMIN';
  });

  constructor(
    private clientService: ClientService,
     private router: Router,
      private authService: AuthService
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

  editingClient = signal<ClientProfileResponse | null>(null);

  showEditModal = signal(false);

  editClientForm = signal({
    driverLicense: '',
    birthDate: '',
    personalEmail: '',
    rentCount: 0,
    userId: 0
  });

  openEditClient(client: ClientProfileResponse) {
  this.editingClient.set(client);

    this.editClientForm.set({
      driverLicense: client.driverLicense,
      birthDate: client.birthDate,
      personalEmail: client.personalEmail,
      rentCount: 0, 
      userId: 0
    });

    this.showEditModal.set(true);
  }

  closeEditModal() {
    this.showEditModal.set(false);
    this.editingClient.set(null);
  }

  updateField<K extends keyof ClientProfileResponse>(
      key: K,
      value: ClientProfileResponse[K]
    ) {
      this.editClientForm.update(emp => {
        if (!emp) return emp;
        return { ...emp, [key]: value };
      });
    }

  saveClient() {
    const client = this.editingClient();
    if (!client) return;

    const request = {
      driverLicense: this.editClientForm().driverLicense,
      birthDate: this.editClientForm().birthDate,
      personalEmail: this.editClientForm().personalEmail,
      rentCount: 0,
      userId: 0
    };

    console.log('Updating client with data:', request);
    

    this.clientService.updateClient(client.login, request).subscribe({
      next: () => {
        this.loadClients();
        this.closeEditModal();
      },
      error: (err) => {
        console.error(err);
        alert('Ошибка обновления клиента');
      }
    });
  }
}
