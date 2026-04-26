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

  private parseJwt(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
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
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { login, password }).subscribe({
      next: (response) => {
        const payload = this.parseJwt(response.token);
        const role = payload?.role?.[0] || 'CLIENT';
        const user = { login, role };
        
        console.log('Token:', response.token);
        console.log('Role:', role);
        
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