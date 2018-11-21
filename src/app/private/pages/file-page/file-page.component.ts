import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FileService } from 'src/app/common/services/file.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-file-page',
  templateUrl: './file-page.component.html',
  styleUrls: ['./file-page.component.css']
})
export class FilePageComponent implements OnInit {

  File: {};

  constructor(
    private route: ActivatedRoute,
    private fs: FileService,
  ) { }

  ngOnInit() {
    this.getFile();
  }

  getFile() {
    const fid = +this.route.snapshot.paramMap.get('id');
    this.fs.getFile(fid).subscribe(file => this.File = file)
  }

}
