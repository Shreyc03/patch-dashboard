// app.routes.ts
import { Routes } from '@angular/router';
import { Layout } from './layout/layout'; 
import { Dashboard } from './dashboard/dashboard';
import { Customers } from './customers/customers';
import { Agents } from './agents/agents';
import { Patches } from './patches/patches';
import { ActivityLogs } from './activity/activity';

export const routes: Routes = [
  {
    path: '',
    component: Layout,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: Dashboard },
      { path: 'customers', component: Customers },
      { path: 'agents', component: Agents },
      { path: 'patches', component: Patches },
      { path: 'activity', component: ActivityLogs }
    ]
  }
];
