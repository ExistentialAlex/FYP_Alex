import { Component, OnInit } from '@angular/core';
import { FileDetailsComponent } from '../file-details/file-details.component';
import { CommonService } from 'src/app/common/services/common.service';
import { faMinusCircle } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-contexts',
  templateUrl: './contexts.component.html',
  styleUrls: ['../file-details/file-details.component.scss']
})
export class ContextsComponent implements OnInit {

  faMinusCircle = faMinusCircle;

  constructor(private fd: FileDetailsComponent, private cs: CommonService) { }

  ngOnInit() {}

}
