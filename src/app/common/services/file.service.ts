import { Injectable } from "@angular/core";
import {
  AngularFireUploadTask,
  AngularFireStorage
} from "@angular/fire/storage";
import { Observable, ObservableLike, Subject, Subscription } from "rxjs";
import { AngularFirestore } from "@angular/fire/firestore";
import { AuthService } from "./auth.service";
import { finalize, tap, switchMap } from "rxjs/operators";

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

  constructor(
    private storage: AngularFireStorage,
    private db: AngularFirestore,
    private auth: AuthService
  ) {
    this.fileQuery = this.auth
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
    this.fileQuery.subscribe(queriedItems => {
      this.fileList = queriedItems;
    });
  }

  startFileUpload(event: FileList) {
    for (var i = 0; i < event.item.length; i++) {
      const userID = this.auth.getUserID();

      console.log(event.item.length);

      // The File object
      var file = event.item(i);

      // Client-side validation example
      if (file.name.split(".")[1] !== ("docx" || "doc" || "pdf" || "txt")) {
        console.error("unsupported file type :( ");
        return;
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

      // The file's download URL
      this.task
        .snapshotChanges()
        .pipe(
          finalize(
            () => (this.downloadURL = this.storage.ref(path).getDownloadURL())
          )
        )
        .subscribe();

      this.snapshot = this.task.snapshotChanges().pipe(
        tap(snap => {
          if (snap.bytesTransferred === snap.totalBytes) {
            // Update firestore on completion
            file_upload_name = file_upload_name.split(".")[0];
            this.db.doc(`FYP_FILES/${file_upload_name}`).set({
              uid: userID,
              fid: file_upload_name,
              file_name: file.name.split(".")[0],
              file_extension: file.name.split(".")[1],
              file_type: file.type,
              path,
              size: snap.totalBytes,
              processed: 0
            });
          }
        })
      );
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
