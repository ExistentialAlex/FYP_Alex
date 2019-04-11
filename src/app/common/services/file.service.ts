import { Injectable } from '@angular/core';
import { AngularFireUploadTask, AngularFireStorage } from '@angular/fire/storage';
import { Observable, of } from 'rxjs';
import { AngularFirestore } from '@angular/fire/firestore';
import { AuthService } from './auth.service';
import { switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import * as firebase from 'firebase/app';

// Defined interfaces for the various objects being used in the file service
interface File {
  fid: string;
  file_extension: string;
  file_name: string;
  file_type: string;
  path: string;
  processed: number;
  size: number;
  uid: string;
}
interface Context {
  fid: string;
  cid: string;
  context_string: string;
  sentimental_value: number;
  date: number;
}

interface SearchTerm {
  searchTerm: string;
  Id: number;
}

@Injectable({
  providedIn: 'root',
})
export class FileService {
  // Main task
  task: AngularFireUploadTask;
  // Progress monitoring
  percentage: Observable<number>;
  snapshot: Observable<any>;
  uploadError: string;
  searchTerms: SearchTerm[] = [];
  stids: number[] = [];

  constructor(
    private storage: AngularFireStorage,
    private db: AngularFirestore,
    private auth: AuthService,
    private router: Router
  ) {}

  /**
   * Retrieves the files from the currently signed in user.
   *
   * @returns The user's file collection, as an Observable.
   */
  getUserFiles(): Observable<Array<Object>> {
    return this.auth
      .getUserData() // Take the user data and pipe it so that it can be used for the Firestore query.
      .pipe(
        switchMap(user =>
          this.db
            .collection('FYP_FILES', ref => ref.where('uid', '==', `${user.uid}`))
            .valueChanges()
        )
      );
  }

  /**
   * Gets a file based on the file ID specified.
   *
   * @param fid - File ID of the file to retrieve.
   * @returns The file as an Observable
   */
  // Gets a file based on the file ID specified.
  getFile(fid: string): Observable<Object> {
    return this.db.doc(`FYP_FILES/${fid}`).valueChanges();
  }

  /**
   * Get the serch terms from the searchTerms array.
   *
   * @returns the searchTerms array of search terms
   */
  getSearchTerms(): SearchTerm[] {
    return this.searchTerms;
  }

  /**
   * Gets the search term IDs currently stored in the stids array.
   *
   * @returns The stids array of search term IDs.
   */
  getSearchTermIds(): number[] {
    return this.stids;
  }

  /**
   * Add a search term specified in the Search Term Form
   * Adds the search term ID to stids
   * Adds the search term to the searchTerms array.
   *
   * @param searchTerm - The search term to add, contains an ID and String.
   *
   */
  addSearchTerm(searchTerm: SearchTerm): void {
    this.stids.push(searchTerm.Id);
    this.searchTerms.push(searchTerm);
  }

  /**
   * Removes a search term from the searchTerms array based on the search term ID specified.
   *
   * @param searchTermId - The ID of the search term to remove.
   * @returns The modified searchTerms array.
   */
  removeSearchTerm(searchTermId: number): SearchTerm[] {
    return this.searchTerms.splice(this.searchTerms.findIndex(st => st.Id === searchTermId), 1);
  }

  /**
   * Clears all of the search terms from the searchTerms array.
   */
  clearSearchTerms(): void {
    const searchTermIds = this.getSearchTermIds();
    searchTermIds.forEach(Id => {
      this.removeSearchTerm(Id);
    });
    this.stids.length = 0;
  }

  /**
   * Retrieves the contexts for a file based on the file ID specified
   *
   * @param fid - The file ID of a file, made up of a timestamp and the files name.
   * @returns The collection of contexts for that file.
   */
  getFileContexts(fid: string): Observable<Object[]> {
    return this.db
      .collection('FYP_CONTEXTS', ref => ref.where('fid', '==', `${fid}`))
      .valueChanges();
  }

  /**
   * Deletes the file from Firestore, along with all of that file's contexts.
   *
   * @param fid - File ID, the ID of the file to delete.
   * @param ext - File Extension, the extension of the file to delete.
   */
  deleteFile(fid: string, ext: string): void {
    const userID = this.auth.getUserID();
    const fileName = fid + '.' + ext;
    const storageRef = firebase.storage().ref();
    this.deleteAllContexts(fid);
    storageRef
      .child(`FYP_FILES/${userID}/${fileName}`)
      .delete()
      .then(() => {
        this.db
          .doc(`FYP_FILES/${fid}`)
          .delete()
          .then(() => {
            console.log('File Deleted Successfully');
            this.router.navigate(['/private/files']);
          })
          .catch(error => this.auth.handleError(error));
      })
      .catch(error => this.auth.handleError(error));
  }

  /**
   * Deletes a context based on the ID specified.
   *
   * @param cid - Context ID, the ID of the context to delete.
   */
  deleteContext(cid: string): void {
    this.db
      .doc(`FYP_CONTEXTS/${cid}`)
      .delete()
      .then(() => {
        console.log('Context Deleted Successfully');
      })
      .catch(error => this.auth.handleError(error));
  }

  /**
   * Deletes all of the contexts for a file.
   *
   * @param fid - File ID, the ID of the file from which to delete the contexts.
   */
  deleteAllContexts(fid: string): void {
    this.getFileContexts(fid).subscribe(contexts =>
      contexts.forEach((context: Context) => {
        this.deleteContext(context.cid);
      })
    );
  }

  /**
   * Uploads one or more files to Firebase,
   *  creates a Firestore document for the file,
   *  adds the search terms specified in the search terms form to the file for processing.
   *
   * @param files - The files to be uploaded to Firebase.
   */
  startFileUpload(files: FileList): void {
    for (let i = 0; i < files.length; i++) {
      const userID = this.auth.getUserID();

      // The File object
      const file = files.item(i);
      // File Extension
      const fileExtension = file.name.split('.')[1];

      // Validates the document extension to make sure it is valid.
      if (fileExtension !== 'docx') {
        if (fileExtension !== 'doc') {
          if (fileExtension !== 'pdf') {
            if (fileExtension !== 'txt') {
              console.error('unsupported file type :( ');
              this.uploadError =
                'Unsupported File Type, please select a Word Document, PDF or Text File.';
              return;
            }
          }
        }
      }
      // The files ID
      let file_upload_name = `${new Date().getTime()}_${file.name}`;

      // The storage path
      const path = `FYP_FILES/${userID}/${file_upload_name}`;

      // Adds some custom meta data to the file which is accessible in Firebase.
      const customMetadata = { uid: userID };

      // The main task
      this.task = this.storage.upload(path, file, { customMetadata });

      // Progress monitoring
      this.percentage = this.task.percentageChanges();
      this.snapshot = this.task.snapshotChanges();

      file_upload_name = file_upload_name.split('.')[0];
      this.db.doc(`FYP_FILES/${file_upload_name}`).set({
        uid: userID,
        fid: file_upload_name,
        file_name: file.name.split('.')[0],
        file_extension: file.name.split('.')[1],
        file_type: file.type,
        path,
        size: file.size,
        processed: 0,
        searchTerms: this.getSearchTerms(),
      });
    }
  }

  /**
   * Determines if the upload task is active
   *
   * @param snapshot - The current upload snapshot for a file.
   */
  isActive(snapshot) {
    return snapshot.state === 'running' && snapshot.bytesTransferred < snapshot.totalBytes;
  }
}
