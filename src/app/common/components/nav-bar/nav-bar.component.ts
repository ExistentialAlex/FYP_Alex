import { Component, OnInit } from "@angular/core";
import { AuthService } from "src/app/common/services/auth.service";
import { Router } from "@angular/router";
import { CommonService } from "../../services/common.service";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

@Component({
  selector: "app-nav-bar",
  templateUrl: "./nav-bar.component.html",
  styleUrls: ["./nav-bar.component.scss"]
})
export class NavBarComponent implements OnInit {

  faArrowLeft = faArrowLeft

  constructor(
    public auth: AuthService,
    public router: Router,
    public cs: CommonService
  ) {}

  ngOnInit() {}
}
