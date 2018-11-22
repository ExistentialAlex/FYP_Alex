import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { FileService } from "src/app/common/services/file.service";
import {
  faFileWord,
  faFile,
  faFilePdf
} from "@fortawesome/free-solid-svg-icons";

@Component({
  selector: "app-file-details",
  templateUrl: "./file-details.component.html",
  styleUrls: ["./file-details.component.scss"]
})
export class FileDetailsComponent implements OnInit {
  //Variables
  file: {};
  contexts: {}[];
  locations: {}[];

  //Icon generation
  faFileWord = faFileWord;
  faFile = faFile;
  faFilePdf = faFilePdf;

  constructor(
    private route: ActivatedRoute,
    private fs: FileService,
  ) {}

  ngOnInit() {
    //Initialise each variable, otherwise errors are produced
    this.file = {};
    this.contexts = [{}];
    this.locations = [{}];
    //Retrieve the file data
    this.getFileData();
  }
  
  //Retrieves the file data to be displayed in the FileDetailComponent
  getFileData() {
    var fid = '';
    //Retrieves the file ID from the URL
    this.route.params.subscribe(params => {
      fid = params['id'];
    });
    //Retrieves the file data from the db
    this.fs.getFile(fid).subscribe(file => {
      this.file = file;
    });
    this.getContexts(fid);
  }
  
  //Retrieves the array of contexts for a file from the db
  getContexts(fid) {
    this.fs.getFileContexts(fid).subscribe(contexts => {
      this.contexts = contexts;
      this.getLocations(contexts)
    });
  }

  //Retrieves the location for each context in a file
  getLocations(contexts) {
    for (var i = 0; i < contexts.length; i++) {
      this.fs.getContextLocation(contexts[i]).subscribe(location => {
        this.locations.push(location);
      });
    }
  }
}
