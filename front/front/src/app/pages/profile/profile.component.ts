import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { ClientService } from '../../services/client.service';
import { RentalService } from '../../services/rental.service';
import { UserProfileResponse } from '../../models/user-profile.model';
import { Rental } from '../../models/client.model';
import { RentalStatusPipe } from '../../models/RentalStatusPipe ';
import { ReactiveFormsModule } from '@angular/forms';
import { EmployeeService } from '../../services/employee.service';
import { RolePipe } from '../../models/role.pipe';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { Profile } from '../../models/user-profile.model';
import { Observable, map } from 'rxjs';
import { EmployeeProfileResponse, ClientProfileResponse } from '../../models/user-profile.model';



@Component({
  selector: 'app-profile',
  imports: [CommonModule, RentalStatusPipe, ReactiveFormsModule, RolePipe],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  profile = signal<Profile | null>(null);
/* 
  profileClients = signal<EmployeeBriefResponse | null>(null);
  profileEmployees = signal<EmployeeBriefResponse | null>(null); */


  rentals = signal<Rental[]>([]);
  isLoading = signal(true);
  userRole = signal<string | null>(null);

  isClient = computed(() => this.userRole() === 'CLIENT');
  isManager = computed(() => this.userRole() === 'MANAGER');
  isAdmin = computed(() => this.userRole() === 'ADMIN');

  editForm!: FormGroup;
  isEditMode = signal(false);

  sortField = signal<'startDate' | 'price' | 'status'>('startDate');
  sortDirection = signal<'asc' | 'desc'>('desc');

  editingRental = signal<Rental | null>(null);
  editRentalForm!: FormGroup;

  constructor(
    private authService: AuthService,
    private clientService: ClientService,
    private rentalService: RentalService,
    private employeeService: EmployeeService,
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    const user = this.authService.currentUser();
    if (!user?.userId) {
      console.error('User ID not found');
      this.isLoading.set(false);
      return;
    }

    this.userRole.set(this.authService.getRole());

    let profileRequest: Observable<Profile>;

    if (this.userRole() === 'CLIENT') {
      profileRequest = this.clientService.getProfile(user.userId).pipe(
        map(profile => ({ ...profile, type: 'CLIENT' as const }))
      );
    } else if (this.userRole() === 'MANAGER' || this.userRole() === 'ADMIN') {
      profileRequest = this.employeeService.getProfile(user.userId).pipe(
        map(profile => ({ ...profile, type: 'EMPLOYEE' as const }))
      );
    } else {
      console.error('Unknown user role:', this.userRole());
      this.isLoading.set(false);
      return;
    }

    profileRequest.subscribe({
      next: (profile) => {
        this.profile.set(profile);
        this.initForm(profile);
        this.loadRentals();
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load profile:', err);
        this.isLoading.set(false);
      }
    });
  }

  isEmployeeProfile(profile: Profile | null): profile is EmployeeProfileResponse {
    return !!profile && profile.type === 'EMPLOYEE';
  }

  isClientProfile(profile: Profile | null): profile is ClientProfileResponse {
    return !!profile && profile.type === 'CLIENT';
  }

  private initForm(profile: UserProfileResponse) {
    this.editForm = this.fb.group({
      login: [profile.login, Validators.required],
      fullName: [profile.fullName, Validators.required],
      phone: [profile.phone],
      password: [''] // пустой = не менять
    });
  }

  loadRentals() {
    const user = this.authService.currentUser();
    if (!user?.userId) {
      console.error('User ID not found for rentals');
      this.isLoading.set(false);
      return;
    }

    const role = this.userRole();

    let request;

    if (role === 'ADMIN') {
      request = this.rentalService.getAll();
    } else if (role === 'MANAGER') {
      request = this.rentalService.getManagerRentals(user.userId);
    } else {
      request = this.rentalService.getMyRentals(user.userId);
    }

    request.subscribe({
      next: (rentals) => {
        this.rentals.set(rentals);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load rentals:', err);
        this.isLoading.set(false);
      }
    });
  }

  sortedRentals = computed(() => {
    const field = this.sortField();
    const dir = this.sortDirection();
    const multiplier = dir === 'asc' ? 1 : -1;

    return [...this.rentals()].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (field) {
        case 'startDate':
          aValue = new Date(a.startDate).getTime();
          bValue = new Date(b.startDate).getTime();
          break;

        case 'price':
          aValue = this.getRentalPrice(a);
          bValue = this.getRentalPrice(b);
          break;

        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;

        default:
          return 0;
      }

      if (aValue < bValue) return -1 * multiplier;
      if (aValue > bValue) return 1 * multiplier;
      return 0;
    });
  });

  setSort(field: 'startDate' | 'price' | 'status') {
    if (this.sortField() === field) {
      this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortField.set(field);
      this.sortDirection.set('desc');
    }
  }

  getRentalDays(rental: Rental): number {
    const start = new Date(rental.startDate);
    const end = new Date(rental.endDate);

    const diff = end.getTime() - start.getTime();
    return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  getRentalPrice(rental: Rental): number {
    const days = this.getRentalDays(rental);

    return rental.cars.reduce((sum, car) => {
      return sum + (car.price * days);
    }, 0);
  }

  getRentalDeposit(rental: Rental): number {
    return rental.cars.reduce((sum, car) => {
      return sum + car.deposit;
    }, 0);
  }

  logout() {
    this.authService.logout();
  }

  goHome() {
    this.router.navigate(['/home']);
  }

  openEdit() {
    if (this.profile()) {
      this.initForm(this.profile()!);
      this.isEditMode.set(true);
    }
  }

  saveProfile() {
    const user = this.authService.currentUser();
    if (!user?.userId) return;

    const formValue = this.editForm.value;

    const request = {
      login: formValue.login,
      fullName: formValue.fullName,
      phone: formValue.phone
    };

    this.userService.updateUser(user.userId, request).subscribe({
      next: (updated) => {
        const current = this.profile();

        if (!current) return;

        this.profile.set({
          ...current,
          ...updated
        });

        this.isEditMode.set(false);
      },
      error: (err) => {
        console.error('Update failed:', err);
        alert('Ошибка обновления профиля');
      }
    });
  }

  closeEdit() {
    this.isEditMode.set(false);
  }

  cancelRental(rentalId: number) {
    if (!confirm('Отменить аренду?')) {
      return;
    }

    this.rentalService.cancel(rentalId).subscribe({
      next: () => {
        this.rentals.update(rentals =>
          rentals.map(r =>
            r.id === rentalId
              ? { ...r, status: 'CANCELLED' }
              : r
          )
        );
      },
      error: (err) => {
        console.error('Failed to cancel rental:', err);
        alert(err.error?.message || 'Ошибка при отмене аренды');
      }
    });
  }

  openEditRental(rental: Rental) {
    console.log('OPEN EDIT', rental);
    // Сначала создаём форму
    this.editRentalForm = this.fb.group({
      status: [rental.status, Validators.required],
      startDate: [rental.startDate, Validators.required],
      endDate: [rental.endDate, Validators.required],
      comment: [rental.comment || '']
    });

    // Затем устанавливаем сигнал
    this.editingRental.set(rental);
  }


  closeEditRental() {
    this.editingRental.set(null);
  }

  saveRentalEdit() {
  const rental = this.editingRental();
  if (!rental) return;

  const updated = {
    ...rental,
    ...this.editRentalForm.value
  };

  this.rentalService.update(rental.id, this.editRentalForm.value).subscribe({
      next: (res) => {
        this.rentals.update(list =>
          list.map(r => r.id === rental.id ? res : r)
        );

        this.editingRental.set(null);
      },
      error: (err) => {
        console.error('Update rental failed:', err);
        alert('Ошибка обновления аренды');
      }
    });
  }
}