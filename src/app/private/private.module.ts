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
import { CityListComponent } from './components/city-list/city-list.component';
import { TownListComponent } from './components/town-list/town-list.component';
import { ReactiveFormsModule } from '@angular/forms';

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
    path: 'fileDetails/:id',
    component: FilePageComponent
  }
]

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
    CityListComponent,
    TownListComponent
  ],
  providers: [
    AuthService,
    NotifyService
  ]
})
export class PrivateModule { }
