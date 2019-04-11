import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Route } from '@angular/router';
import { ProfilePageComponent } from './pages/profile-page/profile-page.component';
import { UserDetailsComponent } from './components/user-details/user-details.component';
import { FileUploadComponent } from './components/file-upload/file-upload.component';
import { FileListComponent } from './components/file-list/file-list.component';
import { AuthService } from '../common/services/auth.service';
import { NotifyService } from '../common/services/notify.service';
import { FileSizePipe } from '../common/pipes/file-size.pipe';
import { DragndropDirective } from '../common/directives/dragndrop.directive';
import { FilePageComponent } from './pages/file-page/file-page.component';
import { HttpClientModule } from '@angular/common/http';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FileDetailsComponent } from './components/file-details/file-details.component';
import { ReactiveFormsModule } from '@angular/forms';
import { UserDetailsFormComponent } from './components/user-details-form/user-details-form.component';
import { FileUploadPageComponent } from './pages/file-upload-page/file-upload-page.component';
import { SearchTermsComponent } from './components/search-terms/search-terms.component';
import { ContextsComponent } from './components/contexts/contexts.component';
import { SearchTermViewerComponent } from './components/search-term-viewer/search-term-viewer.component';
import { SearchTermViewerPageComponent } from './pages/search-term-viewer-page/search-term-viewer-page.component';

// All of the routes for the private side of the application.
const routes: Route[] = [
  {
    path: 'files',
    component: FileUploadPageComponent
  },
  {
    path: 'profile',
    component: ProfilePageComponent
  },
  {
    path: 'fileDetails/:id',
    component: FilePageComponent
  },
  {
    path: 'searchTerm/:id',
    component: SearchTermViewerPageComponent
  }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    RouterModule.forChild(routes),
    FontAwesomeModule,
    ReactiveFormsModule,
    HttpClientModule
  ],
  declarations: [
    ProfilePageComponent,
    FilePageComponent,
    UserDetailsComponent,
    FileUploadComponent,
    FileListComponent,
    DragndropDirective,
    FileSizePipe,
    FileDetailsComponent,
    UserDetailsFormComponent,
    FileUploadPageComponent,
    SearchTermsComponent,
    ContextsComponent,
    SearchTermViewerComponent,
    SearchTermViewerPageComponent
  ],
  providers: [
    AuthService,
    NotifyService,
    SearchTermsComponent
  ]
})
export class PrivateModule { }
