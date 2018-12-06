import { Route } from '@angular/router';
import { AuthGuard } from './common/guards/auth.guard';

export const routes: Route[] = [
    {
        path: 'public',
        loadChildren: './public/public.module#PublicModule'
    },
    {
        path: 'private',
        loadChildren: './private/private.module#PrivateModule',
        canActivate: [AuthGuard]
    },
    {
        path: '',
        redirectTo: 'public',
        pathMatch: 'full'
    },
    {
        path: '**',
        redirectTo: 'public'
    }
];
