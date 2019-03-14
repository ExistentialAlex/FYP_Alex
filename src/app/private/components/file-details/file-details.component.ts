import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FileService } from 'src/app/common/services/file.service';
import { faFileWord, faFile, faFilePdf } from '@fortawesome/free-solid-svg-icons';
import { LocationService } from 'src/app/common/services/location.service';

interface Context {
  searchTerm: string;
  context_string: string;
  fid: string;
  sentimental_value: number;
  stid: string;
  cid: string;
}

interface ContextCollection {
  searchTerm: string;
  stid: string;
  contexts: Context[];
}

@Component({
  selector: 'app-file-details',
  templateUrl: './file-details.component.html',
  styleUrls: ['./file-details.component.scss'],
})
export class FileDetailsComponent implements OnInit {
  // Variables
  file: Object;
  contexts: Array<any>;
  contextCollections: ContextCollection[];

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
      this.CreateContextCollections(contexts as Context[]);
    });
  }

  CreateContextCollections(contexts: Context[]) {
    const contextCollections: ContextCollection[] = [];
    this.getSearchTerms(contexts).forEach(searchTermString => {
      contextCollections.push({ searchTerm: searchTermString, stid: '', contexts: [] });
    });
    contextCollections.forEach(contextCollection => {
      for (const context of contexts) {
        if (context.searchTerm === contextCollection.searchTerm) {
          contextCollection.contexts.push(context);
          contextCollection.stid = context.stid;
        }
      }
    });
    this.contextCollections = contextCollections;
  }

  getSearchTerms(contexts: Context[]) {
    const flags = [];
    const output = [];
    const l = contexts.length;
    for (let i = 0; i < l; i++) {
      if (flags[contexts[i].searchTerm]) {
        continue;
      }
      flags[contexts[i].searchTerm] = true;
      output.push(contexts[i].searchTerm);
    }
    return output;
  }

  deleteContext(cid: string) {
    this.fs.deleteContext(cid);
  }
}
