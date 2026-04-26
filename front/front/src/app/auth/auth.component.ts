import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-auth',
  imports: [CommonModule, FormsModule],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss'
})
export class AuthComponent {
  isLogin = signal(true);

  loginData = {
    login: '',
    password: ''
  };

  registerData = {
    login: '',
    password: '',
    fullName: '',
    phone: '',
    driverLicense: '',
    birthDate: '',
    personalEmail: ''
  };

  loginErrors = { login: '', password: '' };
  registerErrors: Record<string, string> = {};

  constructor(private authService: AuthService) {}

  switchMode() {
    this.isLogin.set(!this.isLogin());
    this.loginErrors = { login: '', password: '' };
    this.registerErrors = {};
  }

  validateLogin(): boolean {
    this.loginErrors = { login: '', password: '' };
    let isValid = true;

    if (!this.loginData.login) {
      this.loginErrors.login = 'Введите логин';
      isValid = false;
    }

    if (!this.loginData.password) {
      this.loginErrors.password = 'Введите пароль';
      isValid = false;
    } else if (this.loginData.password.length < 6) {
      this.loginErrors.password = 'Пароль должен содержать минимум 6 символов';
      isValid = false;
    }

    return isValid;
  }

  validateRegister(): boolean {
    this.registerErrors = {};
    let isValid = true;

    if (!this.registerData.login) {
      this.registerErrors['login'] = 'Введите логин';
      isValid = false;
    }

    if (!this.registerData.password) {
      this.registerErrors['password'] = 'Введите пароль';
      isValid = false;
    } else if (this.registerData.password.length < 6) {
      this.registerErrors['password'] = 'Пароль должен содержать минимум 6 символов';
      isValid = false;
    }

    if (!this.registerData.fullName) {
      this.registerErrors['fullName'] = 'Введите ФИО';
      isValid = false;
    }

    if (!this.registerData.phone) {
      this.registerErrors['phone'] = 'Введите номер телефона';
      isValid = false;
    } else if (this.registerData.phone.replace(/\D/g, '').length < 11) {
      this.registerErrors['phone'] = 'Номер телефона должен содержать минимум 11 цифр';
      isValid = false;
    }

    if (!this.registerData.driverLicense) {
      this.registerErrors['driverLicense'] = 'Введите номер ВУ';
      isValid = false;
    }

    if (!this.registerData.birthDate) {
      this.registerErrors['birthDate'] = 'Введите дату рождения';
      isValid = false;
    } else {
      const birthDate = new Date(this.registerData.birthDate);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      const dayDiff = today.getDate() - birthDate.getDate();
      const actualAge = monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age;
      
      if (actualAge < 18) {
        this.registerErrors['birthDate'] = 'Возраст должен быть не менее 18 лет';
        isValid = false;
      }
    }

    if (!this.registerData.personalEmail) {
      this.registerErrors['personalEmail'] = 'Введите email';
      isValid = false;
    } else {
      const email = this.registerData.personalEmail;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        this.registerErrors['personalEmail'] = 'Введите корректный email';
        isValid = false;
      }
    }

    return isValid;
  }

  onLogin() {
    if (this.validateLogin()) {
      this.authService.login(this.loginData.login, this.loginData.password);
    }
  }

  onRegister() {
    if (this.validateRegister()) {
      this.authService.register(this.registerData);
    }
  }
}