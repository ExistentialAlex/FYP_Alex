import { Injectable } from '@angular/core';
import {
  AngularFireUploadTask,
  AngularFireStorage
} from '@angular/fire/storage';
import { Observable } from 'rxjs';
import { AngularFirestore } from '@angular/fire/firestore';
import { AuthService } from './auth.service';
import { switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';

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
  lid: string;
  cid: string;
  context_string: string;
  sentimental_value: number;
  date: number;
}

@Injectable({
  providedIn: 'root'
})
export class FileService {
  // Main task
  task: AngularFireUploadTask;
  // Progress monitoring
  percentage: Observable<number>;
  snapshot: Observable<any>;
  fileQuery: Observable<any>;
  fileList: Array<any>;
  uploadError: string;

  constructor(
    private storage: AngularFireStorage,
    private db: AngularFirestore,
    private auth: AuthService,
    private router: Router
  ) {}

  getUserFiles(): Observable<Array<Object>> {
    return this.auth
      .getUserData()
      .pipe(
        switchMap((user) =>
          this.db
            .collection('FYP_FILES', ref =>
              ref.where('uid', '==', `${user.uid}`)
            )
            .valueChanges()
        )
      );
  }

  getFile(fid: string): Observable<Object> {
    return this.db.doc(`FYP_FILES/${fid}`).valueChanges();
  }

  getFileContexts(fid: string): Observable<Array<Object>> {
    return this.db
      .collection('FYP_CONTEXTS', ref => ref.where('fid', '==', `${fid}`))
      .valueChanges();
  }

  getCids(fid: string): Array<string> {
    const cids = [];
    this.getFileContexts(fid).subscribe(contexts => contexts.forEach((context: Context) => {
      cids.push(context.cid);
    }));
    return cids;
  }

  deleteFile(fid: string, ext: string): void {
    const userID = this.auth.getUserID();
    this.deleteAllContexts(this.getCids(fid));
    this.db
      .doc(`FYP_FILES/${fid}`)
      .delete()
      .then(() => {
        const fileName = fid + '.' + ext;
        this.storage.storage
          .refFromURL(`FYP_FILES/${userID}/${fileName}`)
          .delete()
          .then(() => {
            console.log('File Deleted Successfully');
            this.router.navigate(['/private/profile']);
          })
          .catch(error => this.auth.handleError(error));
      })
      .catch(error => this.auth.handleError(error));
  }

  deleteContext(cid: string): void {
    this.db
      .doc(`FYP_CONTEXTS/${cid}`)
      .delete()
      .then(() => {
        console.log('Context Deleted Successfully');
      })
      .catch(error => this.auth.handleError(error));
  }

  deleteAllContexts(cids: Array<string>): void {
    cids.forEach(cid => {
      return this.deleteContext(cid);
    });
    }

  startFileUpload(event: FileList): void {
    for (let i = 0; i < event.item.length; i++) {
      const userID = this.auth.getUserID();

      // The File object
      const file = event.item(i);
      // File Extension
      const fileExtension = file.name.split('.')[1];

      // Client-side validation example
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
      let file_upload_name = `${new Date().getTime()}_${file.name}`;

      // The storage path
      const path = `FYP_FILES/${userID}/${file_upload_name}`;

      // Totally optional metadata
      const customMetadata = { app: `File uploaded by ${userID}` };

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
        processed: 0
      });
    }
  }

  // Determines if the upload task is active
  isActive(snapshot) {
    return (
      snapshot.state === 'running' &&
      snapshot.bytesTransferred < snapshot.totalBytes
    );
  }
}
