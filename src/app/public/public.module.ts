import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LandingAreaComponent } from './components/landing-area/landing-area.component';
import { LandingPageComponent } from './pages/landing-page/landing-page.component';
import { RouterModule, Route } from '@angular/router';
import { RegisterComponent } from './components/register/register.component';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LoginComponent } from './components/login/login.component';
import { AuthService } from '../common/services/auth.service';
import { NotifyService } from '../common/services/notify.service';
import { LoginPageComponent } from './pages/login-page/login-page.component';

const routes: Route[] = [
  {
    path: '',
    component: LandingPageComponent
  },
  {
    path: 'login',
    component: LoginPageComponent
  },
  {
    path: '**',
    component: LandingPageComponent
  },
]


@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    RouterModule.forChild(routes),
    AngularFirestoreModule,
    AngularFireAuthModule,
    FormsModule,
    ReactiveFormsModule
  ],
  declarations: [
    LandingAreaComponent,
    LandingPageComponent,
    RegisterComponent,
    LoginComponent,
    LoginPageComponent],
  providers: [
    AuthService,
    NotifyService
  ]
})
export class PublicModule { }
