import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { auth } from 'firebase/app';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';

import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { NotifyService } from './notify.service';

interface User {
  uid: string;
  email: string;
  photoURL?: string;
  first_name?: string;
  last_name?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {

  user: Observable<User>;
  userId: string;

  constructor(
    private afAuth: AngularFireAuth,
    private afs: AngularFirestore,
    private router: Router,
    public notify: NotifyService
  ) {
    //// Get auth data, then get firestore user document || null
    this.user = this.afAuth.authState.pipe(
      switchMap(user => {
        if (user) {
          return this.afs.doc<User>(`FYP_USERS/${user.uid}`).valueChanges()
        } else {
          return of(null)
        }
      })
    )
    
    //Get the User Id
    this.afAuth.authState.subscribe(user => {
      if (user) {
        this.userId = user.uid;
      }
    })
  }

  //Returns the Current Users ID.
  getUserID() {
    return this.userId;
  }

  getUserData() {
    return this.user;
  }

  //Logs in the user
  login(email: string, password: string) {
    this.afAuth.auth.signInWithEmailAndPassword(email,password)
    .then(() => {
      this.router.navigate(['/private/map']);
    })
    .catch(error => this.handleError(error));
  }

  emailSignUp(email: string, password: string) {
    return this.afAuth.auth.createUserWithEmailAndPassword(email, password)
      .then(user => {
        return this.setUserDoc(user)
      })
      .catch(error => this.handleError(error));
  }

  updateUser(user: User, data: any) {
    return this.afs.doc(`FYP_USERS/${user.uid}`).update(data)
  }

  private handleError(error) {
    console.error(error);
    this.notify.update(error.message, 'error')
  }

  private setUserDoc(user) {
    const userData = user.user;
    const userRef: AngularFirestoreDocument<User> = this.afs.doc(`FYP_USERS/${userData.uid}`);
    const data: User = {
      uid: userData.uid,
      email: userData.email
    }
    return userRef.set(data);
  }

  googleLogin() {
    const provider = new auth.GoogleAuthProvider()
    this.oAuthLogin(provider)
    .then(() => {
      this.router.navigate(['/private/map']);
    })
    .catch(error => this.handleError(error));
  }

  private oAuthLogin(provider) {
    return this.afAuth.auth.signInWithPopup(provider)
      .then((credential) => {
        this.updateUserData(credential.user)
      })
  }

  private updateUserData(user) {
    // Sets user data to firestore on login
    const userRef: AngularFirestoreDocument<any> = this.afs.doc(`FYP_USERS/${user.uid}`);
    const names = user.displayName.split(" ");
    const data: User = {
      uid: user.uid,
      email: user.email,
      first_name: names[0],
      last_name: names[1],
      photoURL: user.photoURL
    }
    return userRef.set(data, { merge: true })
  }

  signOut() {
    this.afAuth.auth.signOut().then(() => {
      this.router.navigate(['/public']);
    });
  }
}
