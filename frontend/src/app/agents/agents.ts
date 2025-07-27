import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-agents',
  imports: [CommonModule, FormsModule],
  templateUrl: './agents.html'
})
export class Agents implements OnInit {
  agents: any[] = [];

  search = '';
  status = '';
  sort = 'hostname';
  order = 'asc';
  page = 1;
  limit = 10;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadAgents();
  }

  loadAgents(): void {
    const params = {
      search: this.search,
      status: this.status,
      sort: this.sort,
      order: this.order,
      page: this.page,
      limit: this.limit
    };

    this.http.get<any[]>('http://localhost:3000/api/agents', { params }).subscribe(data => {
      this.agents = data;
    });
  }

  onFilterChange(): void {
    this.page = 1;
    this.loadAgents();
  }

  changeSort(column: string): void {
    if (this.sort === column) {
      this.order = this.order === 'asc' ? 'desc' : 'asc';
    } else {
      this.sort = column;
      this.order = 'asc';
    }
    this.loadAgents();
  }

  nextPage(): void {
    this.page++;
    this.loadAgents();
  }

  prevPage(): void {
    if (this.page > 1) {
      this.page--;
      this.loadAgents();
    }
  }
}
