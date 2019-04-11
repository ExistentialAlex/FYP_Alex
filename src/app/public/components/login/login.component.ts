import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from 'src/app/common/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  loginForm: FormGroup;

  constructor(public fb: FormBuilder, public auth: AuthService) {
  }

  ngOnInit() {
    // Creates the login form with email and password validators.
    this.loginForm = this.fb.group({
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
  }

  /**
   * Gets the value from the Email field in the Login Form.
   */
  get email() {return this.loginForm.get('email'); }

  /**
   * Gets the value from the Password field in the Login Form.
   */
  get password() {return this.loginForm.get('password'); }

  /**
   * Pass the values from the login form to the Auth.login()
   */
  login() {
    this.auth.login(this.email.value, this.password.value);
  }

}
