import { Component, OnInit } from "@angular/core";
import { AuthService } from "src/app/common/services/auth.service";

@Component({
  selector: "app-user-details",
  templateUrl: "./user-details.component.html",
  styleUrls: ["./user-details.component.scss"]
})
export class UserDetailsComponent implements OnInit {
  user: any;

  constructor(private auth: AuthService) {}

  ngOnInit() {
    this.getUser();
  }

  getUser() {
    this.auth.getUserData().subscribe(user => (this.user = user));
  }
}
