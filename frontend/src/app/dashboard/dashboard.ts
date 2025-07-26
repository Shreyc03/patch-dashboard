import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  standalone: true,
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.html',
})
export class Dashboard implements OnInit {
  summary = {
    customers: 0,
    agents: 0,
    patches: 0,
    deployments: 0
  };

  deployments: any[] = [];
  notifications: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<any>('http://localhost:3000/api/dashboard/summary').subscribe(data => {
      this.summary = data;
    });

    this.http.get<any[]>('http://localhost:3000/api/dashboard/deployments').subscribe(data => {
      this.deployments = data;
    });

    this.http.get<any[]>('http://localhost:3000/api/dashboard/notifications').subscribe(data => {
      this.notifications = data;
    });
  }
}
