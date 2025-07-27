import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpParams } from '@angular/common/http';

@Component({
  standalone: true,
  selector: 'app-patches',
  imports: [CommonModule, FormsModule],
  templateUrl: './patches.html'
})
export class Patches implements OnInit {
  patches: any[] = [];

  // Filters
  platform = '';
  os = '';
  q = '';

  // Pagination
  page = 1;
  limit = 10;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadPatches();
  }

  loadPatches(): void {
    let params = new HttpParams()
      .set('page', this.page.toString())
      .set('limit', this.limit.toString());

    if (this.platform) params = params.set('platform', this.platform);
    if (this.os) params = params.set('os', this.os);
    if (this.q) params = params.set('q', this.q);
    
    params = params.set('sort', 'release_date').set('order', 'desc');

    this.http.get<any[]>('http://localhost:3000/api/patches', { params }).subscribe(data => {
      this.patches = data;
    });
  }

  applyFilters(): void {
    this.page = 1;
    this.loadPatches();
  }

  nextPage(): void {
    this.page++;
    this.loadPatches();
  }

  prevPage(): void {
    if (this.page > 1) {
      this.page--;
      this.loadPatches();
    }
  }
}
