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

const routes: Route[] = [
  {
    path: 'map',
    component: MapPageComponent
  },
  {
    path: 'profile',
    component: ProfilePageComponent
  },
  {
    path: 'fileDetails',
    component: FilePageComponent
  }
]

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    RouterModule.forChild(routes),
  ],
  declarations: [
    MapPageComponent,
    ProfilePageComponent,
    UserDetailsComponent,
    FileUploadComponent,
    FileListComponent,
    LocationViewerComponent,
    LocationViewerPageComponent,
    DragndropDirective,
    FileSizePipe
  ],
  providers: [
    AuthService,
    NotifyService
  ]
})
export class PrivateModule { }