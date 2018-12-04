import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FileService } from 'src/app/common/services/file.service';
import {
  faFileWord,
  faFile,
  faFilePdf
} from '@fortawesome/free-solid-svg-icons';
import { LocationService } from 'src/app/common/services/location.service';

@Component({
  selector: 'app-file-details',
  templateUrl: './file-details.component.html',
  styleUrls: ['./file-details.component.scss']
})
export class FileDetailsComponent implements OnInit {
  // Variables
  file: Object;
  contexts: Array<any>;
  townsTemp: Array<any>;
  citiesTemp: Array<any>;
  townsFinal: Array<any>;
  citiesFinal: Array<any>;

  // Icon generation
  faFileWord = faFileWord;
  faFile = faFile;
  faFilePdf = faFilePdf;

  constructor(
    private route: ActivatedRoute,
    private fs: FileService,
    private ls: LocationService
  ) {}

  ngOnInit() {
    // Initialise each variable, otherwise errors are produced
    this.file = {};
    this.townsTemp = [];
    this.citiesTemp = [];
    // Retrieve the file data
    this.getFileData();
  }

  // Retrieves the file data to be displayed in the FileDetailComponent
  getFileData() {
    // Retrieves the file ID from the URL
    this.route.params.subscribe(params => {
      const fid = params['id'];
      // Retrieves the file data from the db
      this.fs.getFile(fid).subscribe(file => {
        this.file = file;
      });
      this.getContexts(fid);
    });
  }

  // Retrieves the array of contexts for a file from the db
  getContexts(fid) {
    this.fs.getFileContexts(fid).subscribe(contexts => {
      this.getLocations(contexts);
    });
  }

  // Retrieves the location for each context in a file
  getLocations(contexts) {
    const waitFor = contexts.length;
    let resolved = 0;
    // Loop through each context and get the location of the context
    for (let i = 0; i < contexts.length; i++) {
      this.ls.getLocation(contexts[i].lid).subscribe(location => {
        this.sortLocations(location);
        resolved++;
        // Wait for all locations to be retrieved before appending contexts
        if (resolved === waitFor) {
          this.appendContexts(contexts);
        }
      });
    }
  }

  // Sort the locations into towns and cities
  sortLocations(location) {
    if (location.location_type === 'town') {
      this.townsTemp.push(location);
    } else if (location.location_type === 'city') {
      this.citiesTemp.push(location);
    }
  }

  // Add the contexts to the towns and cities
  appendContexts(contexts) {
    // Filter out duplicate towns and cities
    const towns = this.townsTemp.filter(
      (town, index, self) => self.findIndex(t => t.lid === town.lid) === index
    );
    const cities = this.citiesTemp.filter(
      (city, index, self) => self.findIndex(c => c.lid === city.lid) === index
    );

    towns.forEach(element => {
      element.contexts = [];
      for (let i = 0; i < contexts.length; i++) {
        if (contexts[i].lid === element.lid) {
          element.contexts.push(contexts[i]);
        }
      }
    });
    cities.forEach(element => {
      element.contexts = [];
      for (let i = 0; i < contexts.length; i++) {
        if (contexts[i].lid === element.lid) {
          element.contexts.push(contexts[i]);
        }
      }
    });
    this.townsFinal = towns;
    this.citiesFinal = cities;
  }

  deleteContext(cid) {
    this.fs.deleteContext(cid);
  }
}
