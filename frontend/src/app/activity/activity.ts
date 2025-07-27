import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  standalone: true,
  selector: 'app-activity',
  imports: [CommonModule],
  templateUrl: './activity.html'
})
export class ActivityLogs implements OnInit {
  timeline: any[] = [];
  summary: any[] = [];
  allLogs: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<any[]>('http://localhost:3000/api/activity/timeline').subscribe(data => {
      this.timeline = data;
    });

    this.http.get<any[]>('http://localhost:3000/api/activity/summary').subscribe(data => {
      this.summary = data;
    });

    this.http.get<any[]>('http://localhost:3000/api/activity/all').subscribe(data => {
      this.allLogs = data;
    });
  }
}
