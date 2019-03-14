import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Route } from '@angular/router';
import { MapPageComponent } from './pages/map-page/map-page.component';
import { ProfilePageComponent } from './pages/profile-page/profile-page.component';
import { UserDetailsComponent } from './components/user-details/user-details.component';
import { FileUploadComponent } from './components/file-upload/file-upload.component';
import { FileListComponent } from './components/file-list/file-list.component';
import { LocationViewerComponent } from './components/location-viewer/location-viewer.component';
import { LocationViewerPageComponent } from './pages/location-viewer-page/location-viewer-page.component';
import { AuthService } from '../common/services/auth.service';
import { NotifyService } from '../common/services/notify.service';
import { FileSizePipe } from '../common/pipes/file-size.pipe';
import { DragndropDirective } from '../common/directives/dragndrop.directive';
import { FilePageComponent } from './pages/file-page/file-page.component';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FileDetailsComponent } from './components/file-details/file-details.component';
import { ReactiveFormsModule } from '@angular/forms';
import { UserDetailsFormComponent } from './components/user-details-form/user-details-form.component';
import { FileUploadPageComponent } from './pages/file-upload-page/file-upload-page.component';
import { SearchTermsComponent } from './components/search-terms/search-terms.component';
import { ContextsComponent } from './components/contexts/contexts.component';

const routes: Route[] = [
  {
    path: 'map',
    component: MapPageComponent
  },
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
    path: 'locationViewer/:id',
    component: LocationViewerPageComponent
  }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    RouterModule.forChild(routes),
    FontAwesomeModule,
    ReactiveFormsModule
  ],
  declarations: [
    MapPageComponent,
    ProfilePageComponent,
    FilePageComponent,
    UserDetailsComponent,
    FileUploadComponent,
    FileListComponent,
    LocationViewerComponent,
    LocationViewerPageComponent,
    DragndropDirective,
    FileSizePipe,
    FileDetailsComponent,
    UserDetailsFormComponent,
    FileUploadPageComponent,
    SearchTermsComponent,
    ContextsComponent
  ],
  providers: [
    AuthService,
    NotifyService,
    SearchTermsComponent
  ]
})
export class PrivateModule { }
