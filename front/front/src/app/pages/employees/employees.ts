import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmployeeService } from '../../services/employee.service';
import { EmployeeProfileResponse } from '../../models/user-profile.model';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { CreateEmployeeRequest, EmployeeUpdateRequest } from '../../models/employee.model';
import { ReactiveFormsModule, FormsModule  } from '@angular/forms';

@Component({
  selector: 'app-employees',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './employees.html',
  styleUrl: './employees.scss',
})
export class Employees implements OnInit {

  employees = signal<EmployeeProfileResponse[]>([]);
  isLoading = signal(false);

  constructor(
    private employeeService: EmployeeService, 
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadEmployees();
  }

  loadEmployees() {
    this.isLoading.set(true);

    this.employeeService.getAll().subscribe({
      next: (data) => {
        this.employees.set(data);
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
  isAdmin = () => this.authService.currentUser()?.role === 'ADMIN';

  isManager = () => this.authService.currentUser()?.role === 'MANAGER';

  canEdit = () => this.isAdmin() || this.isManager();

  editEmployee(emp: EmployeeProfileResponse) {
    this.editingEmployee.set({
      id: emp.id,
      position: emp.position,
      salary: emp.salary ?? 0,
      department: emp.department,
      officeNumber: emp.officeNumber,
      workEmail: emp.workEmail
    });

    this.showEditModal.set(true);
  }

  editingEmployee = signal<EmployeeUpdateRequest | null>(null);
  showEditModal = signal(false);

  openEditModal(emp: EmployeeProfileResponse) {
    this.editingEmployee.set({
      id: emp.id,
      position: emp.position,
      salary: emp.salary ?? 0,
      department: emp.department,
      officeNumber: emp.officeNumber,
      workEmail: emp.workEmail
    });

    this.showEditModal.set(true);
  }

  closeEditModal() {
    this.showEditModal.set(false);
    this.editingEmployee.set(null);
  }

  updateField<K extends keyof EmployeeUpdateRequest>(
    key: K,
    value: EmployeeUpdateRequest[K]
  ) {
    this.editingEmployee.update(emp => {
      if (!emp) return emp;
      return { ...emp, [key]: value };
    });
  }

  saveEmployee() {
    const data = this.editingEmployee();
    if (!data) return;

    this.employeeService.update(data.id, data).subscribe({
      next: () => {
        this.closeEditModal();
        this.loadEmployees();
      },
      error: (err) => {
        console.error(err);
        alert('Ошибка обновления сотрудника');
      }
    });
  }

  deleteEmployee(id: number) {
    if (!confirm('Удалить сотрудника?')) return;

    this.employeeService.delete(id).subscribe({
      next: () => this.loadEmployees(),
      error: (err) => {
        console.error(err);
        alert('Ошибка удаления: у сотрудника есть связанные с ним аренды. Сначала удалите их.');
      }
    });
  }

  showCreateModal = signal(false);

  newEmployee = signal<CreateEmployeeRequest>({
    login: '', 
    password: '',
    fullName: '',
    phone: '',
    position: '',
    salary: 0,
    department: '',
    officeNumber: '',
    workEmail: ''
  });

  openCreateModal() {
    this.newEmployee.set({
      login: '',
      password: '',
      fullName: '',
      phone: '',
      position: '',
      salary: 0,
      department: '',
      officeNumber: '',
      workEmail: ''
    });

    this.showCreateModal.set(true);
  }

  closeCreateModal() {
    this.showCreateModal.set(false);
  }

  employeeErrors = signal<Record<string, string>>({});

  validateEmployee(): boolean {
    const e = this.newEmployee();
    const errors: Record<string, string> = {};

    if (!e.login.trim()) errors['login'] = 'Укажите логин';
    if (!e.password.trim()) errors['password'] = 'Укажите пароль';
    if (e.password.length < 6) errors['password'] = 'Пароль минимум 6 символов';

    if (!e.fullName.trim()) errors['fullName'] = 'Укажите ФИО';
    if (!e.phone.trim()) errors['phone'] = 'Укажите телефон';
    if (!e.position.trim()) errors['position'] = 'Укажите должность';
    if (!e.department.trim()) errors['department'] = 'Укажите отдел';
    if (!e.officeNumber.trim()) errors['officeNumber'] = 'Укажите офис';
    if (!e.workEmail.trim()) errors['workEmail'] = 'Укажите email';
    if (e.salary <= 0) errors['salary'] = 'Зарплата должна быть больше 0';

    this.employeeErrors.set(errors);

    return Object.keys(errors).length === 0;
  }

  validationErrors = computed(() => this.employeeErrors());

  isEmployeeValid = computed(() =>
    Object.keys(this.employeeErrors()).length === 0
  );

  createEmployee() {
    if (!this.validateEmployee()) return;

    this.employeeService.create(this.newEmployee()).subscribe({
      next: () => {
        this.closeCreateModal();
        this.loadEmployees();
      },
      error: (err) => {
        console.error(err);
        alert('Ошибка создания сотрудника');
      }
    });
  }

  updateEmployee<K extends keyof CreateEmployeeRequest>(
    key: K,
    value: CreateEmployeeRequest[K]
  ) {
    this.newEmployee.update(emp => ({
      ...emp,
      [key]: value
    }));

    this.validateEmployee(); 
  }

  showPassword = signal(false);

  togglePassword() {
    this.showPassword.set(!this.showPassword());
  }
}
