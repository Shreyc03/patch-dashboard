import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-customers',
  imports: [CommonModule, FormsModule],
  templateUrl: './customers.html'
})
export class Customers implements OnInit {
  customers: any[] = [];

  search = '';
  status = '';
  os = '';
  sort = 'organization_name';
  order = 'asc';
  page = 1;
  limit = 10;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadCustomers();
  }

  loadCustomers(): void {
    const params = {
      search: this.search,
      status: this.status,
      os: this.os,
      sort: this.sort,
      order: this.order,
      page: this.page,
      limit: this.limit
    };

    this.http.get<any[]>('http://localhost:3000/api/customers', { params }).subscribe(data => {
      this.customers = data;
    });
  }

  onFilterChange(): void {
    this.page = 1;
    this.loadCustomers();
  }

  changeSort(column: string): void {
    if (this.sort === column) {
      this.order = this.order === 'asc' ? 'desc' : 'asc';
    } else {
      this.sort = column;
      this.order = 'asc';
    }
    this.loadCustomers();
  }

  nextPage(): void {
    this.page++;
    this.loadCustomers();
  }

  prevPage(): void {
    if (this.page > 1) {
      this.page--;
      this.loadCustomers();
    }
  }
}
