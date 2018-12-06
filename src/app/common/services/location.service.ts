import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AngularFirestore } from '@angular/fire/firestore';

interface Location {
  lid: string;
  location_name: string;
  location_type: string;
  sentimental_value: number;
}

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  constructor(private db: AngularFirestore) {}

  getLocation(lid: string): Observable<Object> {
    return this.db.doc(`FYP_LOCATIONS/${lid}`).valueChanges();
  }

  getAllLocations(): Observable<Array<Object>> {
    return this.db.collection(`FYP_COUNTRIES`, ref => ref.orderBy('country_name')).valueChanges();
  }
}
