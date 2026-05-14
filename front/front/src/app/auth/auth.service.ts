import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { User, AuthResponse, RegisterRequest } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth';
  private tokenKey = 'auth_token';
  private userKey = 'auth_user';

  isAuthenticated = signal(false);
  currentUser = signal<User | null>(null);

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.checkAuth();
  }

  private checkAuth() {
    const token = localStorage.getItem(this.tokenKey);
    const user = localStorage.getItem(this.userKey);
    if (token && user) {
      this.isAuthenticated.set(true);
      this.currentUser.set(JSON.parse(user));
    }
  }

  login(login: string, password: string) {
    return this.http.post<any>(`${this.apiUrl}/login`, { login, password }).subscribe({
      next: (response) => {
        const user = {
          login: response.login,
          role: response.role,
          userId: response.userId
        };

        console.log('Token:', response.token);
        console.log('Role:', response.role);
        console.log('User ID:', response.userId);

        this.loginWithToken(response.token, user);
        this.router.navigate(['/home']);
      },
      error: (err) => {
        console.error('Login failed:', err);
        alert('Неверный логин или пароль');
      }
    });
  }

  register(data: RegisterRequest) {
    return this.http.post<User>(`${this.apiUrl}/register`, data).subscribe({
      next: () => {
        this.login(data.login, data.password);
      },
      error: (err) => {
        if (err.status === 400 && err.error && err.error.message) {
          alert(`${err.error.message}`);
        }
        console.error('Registration failed:', err);
        alert('Ошибка регистрации');
      }
    });
  }

  loginWithToken(token: string, user: User) {
    localStorage.setItem(this.tokenKey, token);
    localStorage.setItem(this.userKey, JSON.stringify(user));
    this.isAuthenticated.set(true);
    this.currentUser.set(user);
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.isAuthenticated.set(false);
    this.currentUser.set(null);
    this.router.navigate(['/auth']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getRole(): string | null {
    const user = this.currentUser();
    return user?.role || null;
  }

  isAdmin(): boolean {
    return this.getRole() === 'ROLE_ADMIN';
  }

  isManager(): boolean {
    return this.getRole() === 'ROLE_MANAGER';
  }

  isClient(): boolean {
    return this.getRole() === 'ROLE_CLIENT';
  }
}