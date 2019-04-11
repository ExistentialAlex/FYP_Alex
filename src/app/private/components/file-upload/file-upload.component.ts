import { Component, OnInit } from '@angular/core';
import { FileService } from 'src/app/common/services/file.service';

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss']
})
export class FileUploadComponent implements OnInit {

  // State for dropzone CSS toggling
  isHovering: boolean;

  constructor(public fs: FileService) {}

  toggleHover(event: boolean) {
    this.isHovering = event;
  }

  ngOnInit() {}

  /**
   * Calls startFileUpload() which uploads the users files to Firebase.
   *
   * @param event - File List to upload to Firebase.
   */
  uploadFile(event: FileList) {
    this.fs.startFileUpload(event);
  }
}
