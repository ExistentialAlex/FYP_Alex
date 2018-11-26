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
  file: any;
  contexts: Array<any>;
  towns: Array<any>;
  cities: Array<any>;

  //Icon generation
  faFileWord = faFileWord;
  faFile = faFile;
  faFilePdf = faFilePdf;

  constructor(private route: ActivatedRoute, private fs: FileService) {}

  ngOnInit() {
    //Initialise each variable, otherwise errors are produced
    this.file = {};
    this.towns = [];
    this.cities = [];
    //Retrieve the file data
    this.getFileData();
  }

  //Retrieves the file data to be displayed in the FileDetailComponent
  getFileData() {
    var fid = "";
    //Retrieves the file ID from the URL
    this.route.params.subscribe(params => {
      fid = params["id"];
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
      this.getLocations(contexts);
    });
  }

  //Retrieves the location for each context in a file
  getLocations(contexts) {
    const waitFor = contexts.length;
    let resolved = 0;
    for (var i = 0; i < contexts.length; i++) {
      this.fs.getContextLocation(contexts[i].lid).subscribe(location => {
        this.sortLocations(location);
        resolved++;
        if (resolved == waitFor) {
          this.appendContexts(contexts);
        }
      });
    }
  }

  sortLocations(location) {
    if (location.location_type == "town") {
      this.towns.push(location);
    } else if (location.location_type == "city") {
      this.cities.push(location);
    }
  }

  appendContexts(contexts) {
    const towns = this.towns.filter(
      (town, index, self) => self.findIndex(t => t.lid === town.lid) === index
    );
    const cities = this.cities.filter(
      (city, index, self) => self.findIndex(c => c.lid === city.lid) === index
    );

    towns.forEach(element => {
      element.contexts = []
      for (var i = 0; i < contexts.length; i++) {
        if (contexts[i].lid == element.lid) {
          element.contexts.push(contexts[i])
        }
      }
    })
    cities.forEach(element => {
      element.contexts = []
      for (var i = 0; i < contexts.length; i++) {
        if (contexts[i].lid == element.lid) {
          element.contexts.push(contexts[i])
        }
      }
    })
    console.log(towns);
    console.log(cities);
    this.towns = towns;
    this.cities = cities;
  }
}
