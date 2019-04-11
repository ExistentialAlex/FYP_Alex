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
    // Get auth data, then get firestore user document || null
    this.user = this.afAuth.authState.pipe(
      switchMap(user => {
        if (user) {
          return this.afs.doc<User>(`FYP_USERS/${user.uid}`).valueChanges();
        } else {
          return of(null);
        }
      })
    );

    // Get the User Id
    this.afAuth.authState.subscribe(user => {
      if (user) {
        this.userId = user.uid;
      }
    });
  }

  /**
   * Gets the Currently signed in Users ID.
   *
   * @returns Current user ID.
   */
  getUserID(): string {
    return this.userId;
  }

  /**
   * Gets the data for the currently signed in user.
   *
   * @returns User Object as an Observable.
   */
  getUserData(): Observable<User> {
    return this.user;
  }

  /**
   * Sign-in a user to the application using an email address and password.
   *
   * @param email - Email Address for the user account
   * @param password - Password for the user account
   */
  // Sign-in the user
  login(email: string, password: string): void {
    this.afAuth.auth.signInWithEmailAndPassword(email, password)
    .then(() => {
      this.router.navigate(['/private/files']);
    })
    .catch(error => this.handleError(error));
  }

  /**
   * Sign-up with the email and password provided by the user.
   *
   * @param email - Email address for the user account
   * @param password - Password for the user account
   */
  emailSignUp(email: string, password: string): Promise<void> {
    return this.afAuth.auth.createUserWithEmailAndPassword(email, password)
      .then(user => {
        // Once authenticated the users database doc is created.
        return this.setUserDoc(user);
      })
      .catch(error => this.handleError(error));
  }

  /**
   * Update the users Firestore document with the new data.
   *
   * @param user - User to be updated
   * @param data - The data to update the Firestore document with.
   */
  updateUser(user: User, data: any): Promise<void> {
    return this.afs.doc(`FYP_USERS/${user.uid}`).update(data);
  }

  /**
   * Handles an error from any part of the application,
   *  logs it to the console and adds it to the notify service.
   *
   * @param error - The error to handle.
   */
  public handleError(error: Error): void {
    console.error(error);
    this.notify.update(error.message, 'error');
  }

  /**
   * Creates the user document in Firestore
   *
   * @param user - User credentials to create the document from.
   */
  private setUserDoc(user: auth.UserCredential): Promise<void> {
    const userData: firebase.User = user.user;
    const userRef: AngularFirestoreDocument<User> = this.afs.doc(`FYP_USERS/${userData.uid}`);
    const data: User = {
      uid: userData.uid,
      email: userData.email
    };
    return userRef.set(data);
  }

  /**
   * Google sign-in function, allows for sign-in with a google account.
   */
  googleLogin(): void {
    const provider = new auth.GoogleAuthProvider();
    this.oAuthLogin(provider)
    .then(() => {
      // Once authenticated an signed in, navigate to files.
      this.router.navigate(['/private/files']);
    })
    .catch(error => this.handleError(error));
  }

  /**
   * Specific Google Sign-in function, triggered by googleLogin()
   *
   * @param provider - Google Authentication Provider for the sign-in popup.
   */
  private oAuthLogin(provider: auth.GoogleAuthProvider): Promise<void> {
    return this.afAuth.auth.signInWithPopup(provider)
      .then((userCredential: auth.UserCredential) => {
        // Update the user data once sign-in is authenticated.
        this.updateUserData(userCredential.user);
      });
  }

  /**
   * Sets user data to firestore on sign-in
   *
   * @param user - User Credentials from Google Sign-in
   */
  private updateUserData(user: firebase.User): Promise<void> {
    const userRef: AngularFirestoreDocument<any> = this.afs.doc(`FYP_USERS/${user.uid}`);
    const names = user.displayName.split(' ');
    const data: User = {
      uid: user.uid,
      email: user.email,
      first_name: names[0],
      last_name: names[1],
      photoURL: user.photoURL
    };
    return userRef.set(data, { merge: true });
  }

  /**
   * Sign-out a user from any session.
   */
  signOut(): void {
    this.afAuth.auth.signOut().then(() => {
      this.router.navigate(['/public']);
    });
  }
}
