import { Component, OnInit, signal,computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CarService } from '../../services/car.service';
import { CarCreateUpdateDto, Car } from '../../models/car.model';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-cars',
  imports: [CommonModule, FormsModule],
  templateUrl: './cars.html',
  styleUrl: './cars.scss',
})
export class Cars implements OnInit {
cars = signal<Car[]>([]);
  isLoading = signal(false);

  constructor(
    private carService: CarService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadCars();
  }

  loadCars() {
    this.isLoading.set(true);

    this.carService.getAll().subscribe({
      next: (cars) => {
        this.cars.set(cars);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.isLoading.set(false);
      }
    });
  }

  goHome() {
    this.router.navigate(['/home']);
  }

  isAdmin = computed(() => {
    return this.authService.currentUser()?.role === 'ADMIN';
  });

  canEdit = computed(() => {
    const role = this.authService.currentUser()?.role;
    return role === 'ADMIN' || role === 'MANAGER';
  });

  editCar(id: number) {
    console.log('Редактирование машины', id);
    // todo потом можно открыть форму или перейти на /cars/edit/:id
  }

  deleteCar(id: number) {
    if (!confirm('Удалить автомобиль?')) {
      return;
    }

    this.carService.delete(id).subscribe({
      next: () => {
        this.loadCars();
      },
      error: (err) => {
        console.error(err);
        alert('Машина не может быть удалена, возможно она связана с арендами');
      }
    });
  }



  showCreateModal = signal(false);

  newCar = signal({
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    price: 0,
    deposit: 0,
    vin: '',
    registrationDate: '',
    engineVolume: 0,
    color: '',
    insuranceValidUntil: '',
    inspectionValidUntil: ''
  });

  openCreateModal() {
    this.newCar.set({
      brand: '',
      model: '',
      year: new Date().getFullYear(),
      price: 0,
      deposit: 0,
      vin: '',
      registrationDate: '',
      engineVolume: 0,
      color: '',
      insuranceValidUntil: '',
      inspectionValidUntil: ''
    });

    this.showCreateModal.set(true);
  }

  closeCreateModal() {
    this.showCreateModal.set(false);
  }

  carFormError = computed(() => {
    const car = this.newCar();

    if (!car.brand.trim()) {
      return 'Укажите марку';
    }

    if (!car.model.trim()) {
      return 'Укажите модель';
    }

    if (car.year < 1900) {
      return 'Укажите корректный год выпуска';
    }

    if (car.price <= 0) {
      return 'Цена должна быть больше нуля';
    }

    if (car.deposit <= 0) {
      return 'Депозит должен быть больше нуля';
    }

    if (!car.vin.trim()) {
      return 'Укажите VIN';
    }

    if (car.engineVolume <= 0) {
      return 'Объём двигателя должен быть больше нуля';
    }

    if (!car.registrationDate) {
      return 'Укажите дату регистрации';
    }

    if (!car.insuranceValidUntil) {
      return 'Укажите срок действия страховки';
    }

    if (!car.inspectionValidUntil) {
      return 'Укажите срок действия техосмотра';
    }

    return '';
  });

  isCarFormValid = computed(() => !this.carFormError());

  createCar() {
    if (!this.isCarFormValid()) {
      alert(this.carFormError());
      return;
    }
    this.carService.create(this.newCar()).subscribe({
      next: () => {
        this.closeCreateModal();
        this.loadCars();
      },
      error: (err) => {
        console.error(err);
        alert('Не удалось создать автомобиль');
      }
    });
  }

  updateNewCar<K extends keyof CarCreateUpdateDto>(
    key: K,
    value: CarCreateUpdateDto[K] | null | undefined
  ) {
    this.newCar.update(car => ({
      ...car,
      [key]: value ?? this.getDefaultValue(key)
    }));
  }

  private getDefaultValue(key: keyof CarCreateUpdateDto) {
    if (
      key === 'price' ||
      key === 'deposit' ||
      key === 'year' ||
      key === 'engineVolume'
    ) {
      return 0;
    }
    return '';
  }

  editingCarId = signal<number | null>(null);
  showEditModal = signal(false);

  openEditCar(car: Car) {
  this.editingCarId.set(car.id);

  this.newCar.set({
    brand: car.brand,
    model: car.model,
    year: car.year,
    price: car.price,
    deposit: car.deposit,
    vin: car.vin ?? '',
    registrationDate: car.registrationDate ?? '',
    engineVolume: car.engineVolume ?? 0,
    color: car.color ?? '',
    insuranceValidUntil: car.insuranceValidUntil ?? '',
    inspectionValidUntil: car.inspectionValidUntil ?? ''
  });

  this.showEditModal.set(true);
  }

  closeEditModal() {
    this.showEditModal.set(false);
    this.editingCarId.set(null);
  }

  updateCar() {
    const id = this.editingCarId();

    if (!id) {
      alert('ID машины не найден');
      return;
    }

    if (!this.isCarFormValid()) {
      alert(this.carFormError());
      return;
    }

    this.carService.update(id, this.newCar()).subscribe({
      next: () => {
        this.closeEditModal();
        this.loadCars();
      },
      error: (err) => {
        console.error(err);
        alert('Не удалось обновить автомобиль');
      }
    });
  }

  currentPage = signal(1);
  pageSize = 5;

  paginatedCars = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.cars().slice(start, end);
  });

  totalPages = computed(() => {
    return Math.ceil(this.cars().length / this.pageSize);
  });

  nextPage() {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(p => p + 1);
    }
  }

  prevPage() {
    if (this.currentPage() > 1) {
      this.currentPage.update(p => p - 1);
    }
  }

  goToPage(page: number) {
    this.currentPage.set(page);
  }

  pages = computed(() => {
    return Array.from({ length: this.totalPages() }, (_, i) => i + 1);
  });
}
