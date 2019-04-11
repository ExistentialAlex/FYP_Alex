import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AngularFirestore } from '@angular/fire/firestore';
import { HttpClient } from '@angular/common/http';
import { faThumbsDown } from '@fortawesome/free-solid-svg-icons';

interface Context {
  searchTerm: string;
  context_string: string;
  fid: string;
  sentimental_value: number;
  stid: string;
  cid: string;
}

interface ImageSearchResult {
  kind: string;
  url: {
    type: string;
    template: string;
  };
  queries: {
    request: [
      {
        title: string;
        totalResults: number;
        searchTerms: string;
        count: number;
        startIndex: number;
        inputEncoding: string;
        outputEncoding: string;
        safe: string;
        cx: string;
        searchType: string;
      }
    ];
    nextPage: [
      {
        title: string;
        totalResults: number;
        searchTerms: string;
        count: number;
        startIndex: number;
        inputEncoding: string;
        outputEncoding: string;
        safe: string;
        cx: string;
        searchType: string;
      }
    ];
  };
  context: {
    title: string;
  };
  searchInformation: {
    searchTime: number;
    formattedSearchTime: string;
    totalResults: number;
    formattedTotalResults: string;
  };
  items: [
    {
      kind: string;
      title: string;
      htmlTitle: string;
      link: string;
      displayLink: string;
      snippet: string;
      htmlSnippet: string;
      mime: string;
      image: {
        contextLink: string;
        height: number;
        width: number;
        byteSize: number;
        thumbnailLink: string;
        thumbnailHeight: number;
        thumbnailWidth: number;
      };
    }
  ];
}

@Component({
  selector: 'app-search-term-viewer',
  templateUrl: './search-term-viewer.component.html',
  styleUrls: ['./search-term-viewer.component.scss'],
})
export class SearchTermViewerComponent implements OnInit {
  searchTerm: string;
  searchTermImage: string;
  searchTermSentiment: number;
  contexts: Context[];

  constructor(
    private route: ActivatedRoute,
    private db: AngularFirestore,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.getSearchTerms();
  }

  /**
   * Gets the search term from the URL and passes the value to other functions.
   */
  getSearchTerms() {
    this.route.params.subscribe(params => {
      const searchTerm = params['id'];
      this.searchTerm = this.firstLetterUpperCase(searchTerm);
      this.getContexts(searchTerm);
      this.getSearchTermImage(searchTerm);
    });
  }

  /**
   * Retrieves the contexts for the search term the user searched for.
   *
   * @param searchTerm - Search Term to retrieve contexts for.
   */
  getContexts(searchTerm: string) {
    this.db
      .collection('FYP_CONTEXTS', ref => ref.where('searchTerm', '==', searchTerm))
      .valueChanges()
      .subscribe((contexts: Context[]) => {
        this.contexts = contexts;
        this.getSearchTermSentiment(contexts);
      });
  }

  /**
   * Calculates the average sentiment value for a Search term from that search terms contexts.
   *
   * @param contexts - Array of Contexts for the search term.
   */
  getSearchTermSentiment(contexts: Context[]) {
    let totalSentiment = 0;
    contexts.forEach(context => {
      totalSentiment = totalSentiment + context.sentimental_value;
    });
    const searchTermSentiment = totalSentiment / contexts.length;
    this.searchTermSentiment = searchTermSentiment;
  }

  /**
   * Converts the first letter of a string to a capital letter.
   *
   * @param string - Input string to convert.
   * @returns Input string with a converted first letter.
   */
  firstLetterUpperCase(string: string): string {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  /**
   * Retrieves an image for the input search term from Google.
   *
   * @param searchTerm - The search term to retrieve an image for.
   */
  getSearchTermImage(searchTerm: string) {
    const key = 'AIzaSyAeOqGMqjySxLETZI6f6wTs6KKnumPGBCk';
    const cx = '002241427258253645059:k-glivlwkcg';
    const num = 1;
    const fullSearch = `https://www.googleapis.com/customsearch/v1?key=${key}&cx=${cx}&q=${searchTerm}&searchType=image&num=${num}`;
    const httpGet = this.http.get(fullSearch);
    httpGet.subscribe((result: ImageSearchResult) => {
      this.searchTermImage = result.items[0].image.thumbnailLink;
    });
  }
}
