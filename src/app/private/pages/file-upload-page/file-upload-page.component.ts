import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/common/services/auth.service';

@Component({
  selector: 'app-file-upload-page',
  templateUrl: './file-upload-page.component.html',
  styleUrls: ['./file-upload-page.component.scss']
})
export class FileUploadPageComponent implements OnInit {

  constructor(public auth: AuthService) { }

  ngOnInit() {
  }

}
