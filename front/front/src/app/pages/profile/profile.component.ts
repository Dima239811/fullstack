import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { ClientService } from '../../services/client.service';
import { RentalService } from '../../services/rental.service';
import { UserProfileResponse } from '../../models/user-profile.model';
import { Rental } from '../../models/client.model';

@Component({
  selector: 'app-profile',
  imports: [CommonModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  profile = signal<UserProfileResponse | null>(null);
  rentals = signal<Rental[]>([]);
  isLoading = signal(true);

  constructor(
    private authService: AuthService,
    private clientService: ClientService,
    private rentalService: RentalService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    const user = this.authService.currentUser();
    console.log('Current User:', user);
    if (!user?.userId) {
      console.error('User ID not found');
      this.isLoading.set(false);
      return;
    }

    this.clientService.getProfile(user.userId).subscribe({
      next: (profile) => {
        this.profile.set(profile);
        this.loadRentals();
      },
      error: (err) => {
        console.error('Failed to load profile:', err);
        this.isLoading.set(false);
      }
    });
  }

  loadRentals() {
    const user = this.authService.currentUser();
    if (!user?.userId) {
      console.error('User ID not found for rentals');
      this.isLoading.set(false);
      return;
    }
    this.rentalService.getMyRentals(user?.userId).subscribe({
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
}