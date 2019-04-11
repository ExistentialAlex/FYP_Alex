import { Component, OnInit } from '@angular/core';
import { FileService } from 'src/app/common/services/file.service';
import { faFileWord, faFile, faFilePdf, faRedo} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-file-list',
  templateUrl: './file-list.component.html',
  styleUrls: ['./file-list.component.scss']
})
export class FileListComponent implements OnInit {

  fileList: any;

  faRedo = faRedo;
  faFileWord = faFileWord;
  faFile = faFile;
  faFilePdf = faFilePdf;

  constructor(public fs: FileService) {
  }

  ngOnInit() {
    this.fileList = this.getUsersFiles();
  }

  /**
   * Retrieves the files uploaded by the currently signed-in user.
   */
  getUsersFiles() {
    this.fs.getUserFiles().subscribe(userFiles => {
      this.fileList = userFiles;
    });
  }
}
