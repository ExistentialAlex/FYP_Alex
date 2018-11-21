import { Component, OnInit } from '@angular/core';
import { FileService } from 'src/app/common/services/file.service';
import { faFileWord, faFile, faFilePdf } from '@fortawesome/free-solid-svg-icons';
import { Subscription, Observable } from 'rxjs';
import { TouchSequence } from 'selenium-webdriver';

@Component({
  selector: 'app-file-list',
  templateUrl: './file-list.component.html',
  styleUrls: ['./file-list.component.scss']
})
export class FileListComponent implements OnInit {

  fileList: any;

  faFileWord = faFileWord;
  faFile = faFile;
  faFilePdf = faFilePdf;

  constructor(public fs: FileService) {
  }

  ngOnInit() {
    this.fileList = this.getUsersFiles();
  }

  getUsersFiles() {
    this.fs.getUserFiles().subscribe(userFiles => {
      this.fileList = userFiles;
    })
  }

}
