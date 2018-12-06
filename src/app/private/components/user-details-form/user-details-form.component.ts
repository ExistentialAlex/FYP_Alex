import { Component, OnInit } from '@angular/core';
import { LocationService } from 'src/app/common/services/location.service';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { AuthService } from 'src/app/common/services/auth.service';

@Component({
  selector: 'app-user-details-form',
  templateUrl: './user-details-form.component.html',
  styleUrls: ['./user-details-form.component.scss']
})
export class UserDetailsFormComponent implements OnInit {
  user: Object;
  genders: Array<any>;
  locations: Array<Object>;

  constructor(
    private auth: AuthService,
    private ls: LocationService,
    private fb: FormBuilder
  ) {}

  userForm: FormGroup;

  ngOnInit() {
    this.userForm = this.fb.group({
      first_name: ['', [Validators.required]],
      last_name: ['', [Validators.required]],
      gender: '',
      location: ''
    });
    this.genders = [
      { id: 1, gender: 'Male' },
      { id: 2, gender: 'Female' },
      { id: 3, gender: 'Other' },
      { id: 4, gender: 'Prefer Not to Say' }
    ];
    this.user = {};
    this.locations = [];
    this.getLocations();
    this.getUser();
  }

  getUser() {
    this.auth.getUserData().subscribe((user: Object) => {
      this.user = user;
    });
  }

  getLocations() {
    this.ls.getAllLocations().subscribe((locations: Array<Location>) => {
      this.locations = locations;
    });
  }

  get first_name() {
    return this.userForm.get('first_name');
  }
  get last_name() {
    return this.userForm.get('last_name');
  }
  get gender() {
    return this.userForm.get('gender');
  }
  get location() {
    return this.userForm.get('location');
  }

  updateUserDetails(user) {
    let first_name_up = this.first_name.value;
    let last_name_up = this.last_name.value;
    let gender_up = this.gender.value;
    let location_up = this.location.value;
    if (first_name_up === '') {
      if (user.first_name != null) {
        first_name_up = user.first_name;
      }
    }
    if (last_name_up === '') {
      if (user.last_name != null) {
        last_name_up = user.last_name;
      }
    }
    if (gender_up === '') {
      if (user.gender != null) {
        gender_up = user.gender;
      }
    }
    if (location_up === '') {
      if (user.location != null) {
        location_up = user.location;
      }
    }

    return this.auth.updateUser(user, {
      first_name: first_name_up,
      last_name: last_name_up,
      gender: gender_up,
      location: location_up
    });
  }
}
