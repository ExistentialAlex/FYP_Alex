import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../common/services/auth.service';
import { FormGroup, FormBuilder, Validators, } from '@angular/forms';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {

  registerForm: FormGroup;
  detailsForm: FormGroup;

  constructor(public fb: FormBuilder, public auth: AuthService) {
  }

  ngOnInit() {
    this.registerForm = this.fb.group({
      'email': ['', [
        Validators.required,
        Validators.email
      ]],
      'password': ['', [
        Validators.pattern('^(?=.*[0-9])(?=.*[a-zA-Z])([a-zA-z0-9]+)$'),
        Validators.minLength(6),
        Validators.maxLength(25),
        Validators.required
      ]]
    });

    this.detailsForm = this.fb.group({
      'first_name': ['', [
        Validators.required
      ]],
      'last_name': ['', [
        Validators.required
      ]]
    });
  }
  get email() {return this.registerForm.get('email'); }
  get password() {return this.registerForm.get('password'); }

  get firstName() {return this.detailsForm.get('first_name'); }
  get lastName() {return this.detailsForm.get('last_name'); }

  signup() {
    return this.auth.emailSignUp(this.email.value, this.password.value);
  }

  setDetails(user) {
    return this.auth.updateUser(user, {first_name: this.firstName.value, last_name: this.lastName.value});
  }

}
