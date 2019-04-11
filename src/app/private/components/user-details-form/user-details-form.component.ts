import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { AuthService } from 'src/app/common/services/auth.service';
import { Subscription } from 'rxjs';

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
    private fb: FormBuilder
  ) {}

  userForm: FormGroup;

  ngOnInit() {
    // Initialises the User Form with the first_name, last_name, gender and location fields.
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
    this.getUser();
  }

  /**
   * Gets the user object from Auth Service and makes it available in the User Details Component.
   *
   * @returns Subscription to the user object.
   */
  getUser(): Subscription {
    return this.auth.getUserData().subscribe((user: Object) => {
      this.user = user;
    });
  }

  /**
   * Gets the value from the first_name field in the User Details Form
   */
  get first_name() {
    return this.userForm.get('first_name');
  }

  /**
   * Gets the value from the last_name field in the User Details Form
   */
  get last_name() {
    return this.userForm.get('last_name');
  }

  /**
   * Gets the value from the gender field in the User Details Form
   */
  get gender() {
    return this.userForm.get('gender');
  }

  /**
   * Updates the users details in Firestore with details in the User Details Form.
   *
   * @param user - User to update the details of.
   */
  updateUserDetails(user) {
    let first_name_up = this.first_name.value;
    let last_name_up = this.last_name.value;
    let gender_up = this.gender.value;
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

    return this.auth.updateUser(user, {
      first_name: first_name_up,
      last_name: last_name_up,
      gender: gender_up
    });
  }
}
