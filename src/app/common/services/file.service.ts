import { Injectable } from "@angular/core";
import {
  AngularFireUploadTask,
  AngularFireStorage
} from "@angular/fire/storage";
import { Observable, ObservableLike, Subject, Subscription, of } from "rxjs";
import { AngularFirestore } from "@angular/fire/firestore";
import { AuthService } from "./auth.service";
import { finalize, tap, switchMap } from "rxjs/operators";
import { NotifyService } from "./notify.service";

@Injectable({
  providedIn: "root"
})
export class FileService {
  // Main task
  task: AngularFireUploadTask;

  // Progress monitoring
  percentage: Observable<number>;

  snapshot: Observable<any>;

  // Download URL
  downloadURL: Observable<string>;

  fileQuery: Observable<any>;

  fileList: Array<any>;

  uploadError: string;

  constructor(
    private storage: AngularFireStorage,
    private db: AngularFirestore,
    private auth: AuthService
  ) {}

  getUserFiles(): Observable<{}[]> {
    return this.auth
      .getUserData()
      .pipe(
        switchMap(user =>
          this.db
            .collection("FYP_FILES", ref =>
              ref.where("uid", "==", `${user.uid}`)
            )
            .valueChanges()
        )
      );
  }

  getFile(fid): Observable<{}> {
    return this.db.doc(`FYP_FILES/${fid}`).valueChanges();
  }

  getFileContexts(fid) {
    return this.db
      .collection("FYP_CONTEXTS", ref => ref.where("fid", "==", `${fid}`))
      .valueChanges();
  }

  getContextLocation(lid) {
    return this.db.doc(`FYP_LOCATIONS/${lid}`).valueChanges();
  }

  deleteFile(fid, ext): void {
    const userID = this.auth.getUserID();
    this.db
      .doc(`FYP_FILES/${fid}`)
      .delete()
      .then(() => {
        var fileName = fid + "." + ext;
        this.storage.storage
          .refFromURL(`FYP_FILES/${userID}/${fileName}`)
          .delete()
          .then(() => {
            console.log("File Deleted Successfully");
          })
          .catch(error => this.auth.handleError(error));
      })
      .catch(error => this.auth.handleError(error));
  }

  deleteContext(cid): void {
    this.db
      .doc(`FYP_CONTEXTS/${cid}`)
      .delete()
      .then(() => {
        console.log("Context Deleted Successfully");
      })
      .catch(error => this.auth.handleError(error));
  }

  deleteAllContexts(cid: string[]): void {
    cid.forEach(cid => this.deleteContext(cid))
    }

  startFileUpload(event: FileList) {
    for (var i = 0; i < event.item.length; i++) {
      const userID = this.auth.getUserID();

      // The File object
      var file = event.item(i);
      //File Extension
      var fileExtension = file.name.split(".")[1];

      // Client-side validation example
      if (fileExtension !== "docx") {
        if (fileExtension !== "doc") {
          if (fileExtension !== "pdf") {
            if (fileExtension !== "txt") {
              console.error("unsupported file type :( ");
              this.uploadError =
                "Unsupported File Type, please select a Word Document, PDF or Text File.";
              return;
            }
          }
        }
      }
      var file_upload_name = `${new Date().getTime()}_${file.name}`;

      // The storage path
      const path = `FYP_FILES/${userID}/${file_upload_name}`;

      // Totally optional metadata
      const customMetadata = { app: `File uploaded by ${userID}` };

      // The main task
      this.task = this.storage.upload(path, file, { customMetadata });

      // Progress monitoring
      this.percentage = this.task.percentageChanges();
      this.snapshot = this.task.snapshotChanges();

      file_upload_name = file_upload_name.split(".")[0];
      this.db.doc(`FYP_FILES/${file_upload_name}`).set({
        uid: userID,
        fid: file_upload_name,
        file_name: file.name.split(".")[0],
        file_extension: file.name.split(".")[1],
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
      snapshot.state === "running" &&
      snapshot.bytesTransferred < snapshot.totalBytes
    );
  }
}
