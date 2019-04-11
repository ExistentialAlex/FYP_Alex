import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/common/services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-user-details',
  templateUrl: './user-details.component.html',
  styleUrls: ['./user-details.component.scss']
})
export class UserDetailsComponent implements OnInit {
  user: Object;

  constructor(
    private auth: AuthService
  ) {}

  ngOnInit() {
    this.user = {};
    this.getUser();
  }

  /**
   * Gets the user object from Auth Service and makes it available in the User Details Component.
   *
   * @returns Subscription to the user object.
   */
  getUser(): Subscription {
    return this.auth.getUserData().subscribe(user => (this.user = user));
  }
}
