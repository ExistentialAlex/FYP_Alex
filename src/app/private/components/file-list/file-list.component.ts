import { Component, OnInit } from '@angular/core';
import { FileService } from 'src/app/common/services/file.service';
import { Subscription, Observable } from 'rxjs';

@Component({
  selector: 'app-file-list',
  templateUrl: './file-list.component.html',
  styleUrls: ['./file-list.component.scss']
})
export class FileListComponent implements OnInit {

  fileList:Observable<any>;

  constructor(public fs: FileService) {
    this.fs.fileQuery.subscribe(queriedItems => {
      this.fileList = queriedItems;
    })
  }

  ngOnInit() {
  }

}
