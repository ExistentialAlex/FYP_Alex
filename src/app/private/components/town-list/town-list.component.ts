import { Component, OnInit } from '@angular/core';
import { FileDetailsComponent } from '../file-details/file-details.component';
import { CommonService } from 'src/app/common/services/common.service';
import { faMinusCircle } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-town-list',
  templateUrl: './town-list.component.html',
  styleUrls: ['../file-details/file-details.component.scss']
})
export class TownListComponent implements OnInit {

  towns: Array<any>;

  faMinusCircle = faMinusCircle;

  constructor(private fd: FileDetailsComponent, private cs: CommonService) { }

  ngOnInit() {
    this.getTowns();
  }

  getTowns() {
    this.towns = this.fd.townsFinal;
  }

}
