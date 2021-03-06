import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AppComponent } from './app.component';
import { AngularFireModule } from '@angular/fire';
import { environment } from '../environments/environment';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { routes } from './app.routes';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { NavBarComponent } from './common/components/nav-bar/nav-bar.component';
import { AuthService } from './common/services/auth.service';
import { NotifyService } from './common/services/notify.service';
import { AuthGuard } from './common/guards/auth.guard';

@NgModule({
  declarations: [
    AppComponent,
    NavBarComponent,
  ],
  imports: [
    BrowserModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule,
    AngularFireStorageModule,
    AngularFireAuthModule,
    FormsModule,
    RouterModule,
    RouterModule.forRoot(routes),
    FontAwesomeModule
  ],
  providers: [
    AuthService,
    NotifyService,
    AuthGuard
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
