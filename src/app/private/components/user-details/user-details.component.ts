import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/common/services/auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-user-details',
  templateUrl: './user-details.component.html',
  styleUrls: ['./user-details.component.scss']
})
export class UserDetailsComponent implements OnInit {
  user: any;
  genders: Array<any>;

  constructor(private auth: AuthService, private fb: FormBuilder) {}

  userForm: FormGroup;

  ngOnInit() {
    this.userForm = this.fb.group({
      first_name: ['', [Validators.required]],
      last_name: ['', [Validators.required]],
      gender: ''
    });
    this.genders = [
      { id: 1, gender: 'Male' },
      { id: 2, gender: 'Female' },
      { id: 3, gender: 'Other' },
      { id: 4, gender: 'Prefer Not to Say' }
    ];
    this.getUser();
  }

  getUser() {
    this.auth.getUserData().subscribe(user => (this.user = user));
  }
}
