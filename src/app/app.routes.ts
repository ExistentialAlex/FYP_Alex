import { Route } from "@angular/router";

export const routes: Route[] = [
    {
        path: 'public',
        loadChildren: './public/public.module#PublicModule'
    },
    {
        path: 'private',
        loadChildren: './private/private.module#PrivateModule'
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
]