import { Component, OnInit, ChangeDetectionStrategy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, registerables, ChartConfiguration, ChartOptions } from 'chart.js';
import { AnalyticsService } from '../../services/analytics.service';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ClientsByBrandReportResponse, ClientBrandAnalytics, AnalyticsByPeriodResponse  } from '../../models/client-brand-analytics';
import { signal } from '@angular/core';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, BaseChartDirective, FormsModule],
  templateUrl: './analytics.html',
  styleUrl: './analytics.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AnalyticsComponent implements OnInit{
  public carsChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Количество аренд',
        backgroundColor: [
          '#42A5F5', '#66BB6A', '#FFA726', '#26C6DA', '#7E57C2', '#FF7043'
        ],
        borderColor: '#1E88E5',
        borderWidth: 1
      }
    ]
  };

  public chartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'top' }
    },
    scales: {
      y: { beginAtZero: true } 
    }
  };

  constructor(private analyticsService: AnalyticsService, private router: Router) {
  }

  ngOnInit(): void {
    this.loadCarsReport();
  }

  loadCarsReport() {
    this.analyticsService.getCarsReport().subscribe({
      next: (res: any) => {
        console.log('Данные для отчета по автомобилям:', res);
        if (res && res.brands) {
          this.carsChartData = {
            labels: res.brands, 
            datasets: [
              {
                label: 'Количество аренд',
                data: res.counts,
                backgroundColor: [
                  '#42A5F5', '#FF7043', '#9CCC65', '#FFCA28', '#26A69A'
                ],
                borderColor: '#1E88E5',
                borderWidth: 1
              }
            ]
          };
        }
      },
      error: (err) => console.error('Ошибка загрузки:', err)
    });
  }

  goBack() {
    this.router.navigate(['/home']);
  }

  public isModalOpen = false;

  openModal() {
    this.isModalOpen = true;
    this.loadCarsReport();
  }

  closeModal() {
    this.isModalOpen = false;
  }

  toggleChart() {
    this.isModalOpen = !this.isModalOpen;
    if (this.isModalOpen) {
      this.loadCarsReport();
    }
  }

  public selectedBrand: string = '';
  public clientsByBrandData = signal<ClientsByBrandReportResponse | null>(null);

  loadClientsByBrand() {
    if (!this.selectedBrand) {
      alert('Пожалуйста, введите название бренда');
      return;
    }

    this.analyticsService.getClientsByBrand(this.selectedBrand).subscribe({
      next: (res) =>{
        this.clientsByBrandData.set(res);
        console.log('Данные для отчета по клиентам по бренду:', res);
      } ,
      error: (err) => console.error('Ошибка:', err)
    });
  }

  trackById(index: number, item: ClientBrandAnalytics): number {
    return item.id;
  }

  readonly dataClients = computed(() => this.clientsByBrandData());

  public showPeriodForm = false;

  public startDate: string = '';
  public endDate: string = '';

  public periodData = signal<AnalyticsByPeriodResponse | null>(null);
  public loadingPeriod = signal(false);

  togglePeriodForm() {
    this.showPeriodForm = !this.showPeriodForm;
  }

  loadPeriodAnalytics() {
    if (!this.startDate || !this.endDate) {
      alert('Выберите даты');
      return;
    }

    this.loadingPeriod.set(true);
    this.periodData.set(null);

    this.analyticsService.getAnalyticsByPeriod(this.startDate, this.endDate)
      .subscribe({
        next: (res) => {
          this.periodData.set(res);
          this.loadingPeriod.set(false);
        },
        error: (err) => {
          console.error(err);
          this.periodData.set(null);
          this.loadingPeriod.set(false);
        }
      });
  }
}