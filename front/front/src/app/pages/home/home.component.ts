import { Component, signal, computed, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { CarService } from '../../services/car.service';
import { RentalService } from '../../services/rental.service';
import { RentalCarService } from '../../services/rentalcar.service';
import { Car } from '../../models/car.model';
import { ClientService } from '../../services/client.service';
import { forkJoin } from 'rxjs';

interface SelectedCarItem {
  car: Car;
  startDate: string;
  endDate: string;
  days: number;
  totalPrice: number;
}

@Component({
  selector: 'app-home',
  imports: [CommonModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  searchQuery = signal('');
  sortBy = signal('brand');
  rentalStartDate = signal('');
  rentalEndDate = signal('');

  cars = signal<Car[]>([]);
  isLoading = signal(false);
  showDateModal = signal(false);
  showConfirmRentalModal = signal(false);
  
  selectedCars = signal<SelectedCarItem[]>([]);
  carAvailability = signal<Map<number, boolean>>(new Map());
  isCheckingAvailability = signal(false);

  filteredCars = computed(() => {
    let result = this.cars();

    if (this.searchQuery()) {
      const query = this.searchQuery().toLowerCase();
      result = result.filter(c =>
        c.brand.toLowerCase().includes(query) ||
        c.model.toLowerCase().includes(query)
      );
    }

    result = [...result].sort((a, b) => {
      if (this.sortBy() === 'price-asc') return a.price - b.price;
      if (this.sortBy() === 'price-desc') return b.price - a.price;
      if (this.sortBy() === 'brand') return a.brand.localeCompare(b.brand);
      return 0;
    });

    return result;
  });

  totalRentalPrice = computed(() => {
    return this.selectedCars().reduce((sum, item) => sum + item.totalPrice, 0);
  });

  totalDeposit = computed(() => {
    return this.selectedCars().reduce((sum, item) => sum + (item.car.deposit * item.days), 0);
  });

  daysCount = computed(() => {
    if (!this.rentalStartDate() || !this.rentalEndDate()) {
      return 0;
    }
    const start = new Date(this.rentalStartDate());
    const end = new Date(this.rentalEndDate());
    const diffTime = end.getTime() - start.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    return Math.max(0, Math.ceil(diffDays));
  });

  isCarSelected = (carId: number): boolean => {
    return this.selectedCars().some(item => item.car.id === carId);
  };

  getCarAvailability = (carId: number): boolean => {
    return this.carAvailability().get(carId) ?? false;
  };

  constructor(
    private clientService: ClientService,
    private carService: CarService,
    private authService: AuthService,
    private rentalService: RentalService,
    private rentalCarService: RentalCarService,
    private router: Router
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
        console.error('Failed to load cars:', err);
        this.isLoading.set(false);
      }
    });
  }

  openDateModal() {
    this.showDateModal.set(true);
  }

  closeDateModal() {
    this.showDateModal.set(false);
  }

  confirmDates() {
    if (!this.rentalStartDate() || !this.rentalEndDate()) {
      alert('Пожалуйста, выберите обе даты');
      return;
    }

    if (new Date(this.rentalEndDate()) <= new Date(this.rentalStartDate())) {
      alert('Дата окончания должна быть позже даты начала');
      return;
    }

    if (this.daysCount() < 1) {
      alert('Минимальный срок аренды - 1 сутки');
      return;
    }

    this.checkAllCarsAvailability();
    this.closeDateModal();
  }

  checkAllCarsAvailability() {
    this.isCheckingAvailability.set(true);
    const availability = new Map<number, boolean>();
    const cars = this.filteredCars();

    const availabilityChecks = cars.map(car =>
      this.rentalCarService.isCarAvailable(
        car.id,
        this.rentalStartDate(),
        this.rentalEndDate()
      )
    );

    forkJoin(availabilityChecks).subscribe({
      next: (results) => {
        cars.forEach((car, index) => {
          availability.set(car.id, results[index]);
        });
        this.carAvailability.set(availability);
        this.isCheckingAvailability.set(false);
      },
      error: (err) => {
        console.error('Failed to check availability:', err);
        this.isCheckingAvailability.set(false);
      }
    });
  }

  isAdmin = computed(() => {
    return this.authService.currentUser()?.role === 'ADMIN';
  });

  isManager = computed(() => {
    return this.authService.currentUser()?.role === 'MANAGER';
  });

  goToCars() {
    this.router.navigate(['/cars']);
  }

  goToClients() {
    this.router.navigate(['/clients']);
  }

  addCarToRental(car: Car) {
    if (this.isCarSelected(car.id)) {
      return;
    }

    const days = this.daysCount();
    const totalPrice = car.price * days;

    const selectedCarItem: SelectedCarItem = {
      car,
      startDate: this.rentalStartDate(),
      endDate: this.rentalEndDate(),
      days,
      totalPrice
    };

    this.selectedCars.update(cars => [...cars, selectedCarItem]);
  }

  removeCarFromRental(carId: number) {
    this.selectedCars.update(cars => 
      cars.filter(item => item.car.id !== carId)
    );
  }

  clearDateSelection() {
    this.rentalStartDate.set('');
    this.rentalEndDate.set('');
    this.selectedCars.set([]);
    this.carAvailability.set(new Map());
  }

  openConfirmRentalModal() {
    if (this.selectedCars().length === 0) {
      alert('Пожалуйста, добавьте хотя бы один автомобиль');
      return;
    }
    console.log('Selected Cars for Rental:', this.selectedCars());
    this.showConfirmRentalModal.set(true);
  }

  closeConfirmRentalModal() {
    this.showConfirmRentalModal.set(false);
  }

  today = new Date().toISOString().split('T')[0];

  isDateRangeValid = computed(() => {
    if (!this.rentalStartDate() || !this.rentalEndDate()) {
      return false;
    }

    const today = new Date(this.today);
    const start = new Date(this.rentalStartDate());
    const end = new Date(this.rentalEndDate());

    if (start <= today) {
      return false;
    }

    if (end <= start) {
      return false;
    }

    return this.daysCount() >= 1;
  });

  dateValidationMessage = computed(() => {
    if (!this.rentalStartDate() || !this.rentalEndDate()) {
      return '';
    }

    const today = new Date(this.today);
    const start = new Date(this.rentalStartDate());
    const end = new Date(this.rentalEndDate());

    if (start <= today) {
      return 'Дата начала должна быть позже текущей даты';
    }

    if (end <= start) {
      return 'Минимальный срок аренды — 1 сутки';
    }

    return '';
  });

  onStartDateChange(value: string) {
  this.rentalStartDate.set(value);

  if (this.rentalEndDate() && this.rentalEndDate() <= value) {
    this.rentalEndDate.set('');
  }
}

  
  confirmRental() {
  const user = this.authService.currentUser();
  if (!user?.userId) {
    alert('Ошибка: пользователь не авторизован');
    return;
  }

  // Получаем данные клиента по ID юзера
  this.clientService.getByUserId(user.userId).subscribe({
    next: (client) => {
      const carIds = this.selectedCars().map(item => item.car.id);

      // Создаем аренду с ID клиента
      this.rentalService.create({
        clientId: client.id,
        startDate: this.rentalStartDate(),
        endDate: this.rentalEndDate(),
        carIds: carIds,
        comment: '',
        discount: 0
      }).subscribe({
        next: (rental) => {
          // Проверяем наличие сотрудника
          if (rental?.employeeFullName) {
            alert(`Все автомобили успешно арендованы!\n\nВаш менеджер: ${rental.employeeFullName}\nТелефон: ${rental.employeeLogin || 'Не указан'}`);
          } else {
            alert('Все автомобили успешно арендованы!');
          }
          this.closeConfirmRentalModal();
          this.clearDateSelection();
          this.loadCars();
        },
        error: (err) => {
          console.error('Failed to create rental:', err);
          alert('Ошибка при аренде автомобилей: ' + (err.error?.message || err.message));
        }
      });
    },
    error: (err) => {
      console.error('Failed to get client:', err);
      alert('Ошибка: клиент не найден');
    }
  });
}

  logout() {
    this.authService.logout();
  }

  goToProfile() {
    this.router.navigate(['/profile']);
  }

  goToEmployees() {
    this.router.navigate(['/employees']);
  }
}