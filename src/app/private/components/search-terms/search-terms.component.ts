import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { FileService } from 'src/app/common/services/file.service';

interface SearchTerm {
  searchTerm: string;
  Id: number;
}

@Component({
  selector: 'app-search-terms',
  templateUrl: './search-terms.component.html',
  styleUrls: ['./search-terms.component.scss'],
})
export class SearchTermsComponent implements OnInit {
  searchTerms: SearchTerm[];
  searchTermsForm: FormGroup;
  ids: number[];

  constructor(public fb: FormBuilder, public fs: FileService) {}

  ngOnInit() {
    this.searchTermsForm = this.fb.group({
      searchTerm: ['', []],
    });
    this.searchTerms = this.fs.getSearchTerms();
  }

  get SearchTerm() {
    return this.searchTermsForm.get('searchTerm');
  }

  addSearchTerm() {
    let id: number;
    if (this.searchTerms.length > 0) {
      id = this.searchTerms[this.searchTerms.length - 1].Id + 1;
    } else {
      id = 1;
    }
    if (this.SearchTerm.value !== '') {
      this.fs.addSearchTerm({
        searchTerm: this.SearchTerm.value,
        Id: id,
      });
    }
  }
}
