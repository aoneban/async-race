import { Routes } from '@angular/router';
import { PageGarageComponent } from './pages/page-garage/page-garage.component';
import { PageWinnersComponent } from './pages/page-winners/page-winners.component';

export const routes: Routes = [
  { path: 'page-garage', component: PageGarageComponent },
  { path: 'page-winners', component: PageWinnersComponent },
  { path: '', redirectTo: '/page-garage', pathMatch: 'full' },
];

export default routes;
