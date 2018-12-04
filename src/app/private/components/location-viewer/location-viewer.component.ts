import { Component, OnInit } from '@angular/core';
import { LocationService } from 'src/app/common/services/location.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-location-viewer',
  templateUrl: './location-viewer.component.html',
  styleUrls: ['./location-viewer.component.scss']
})

export class LocationViewerComponent implements OnInit {
  constructor(private ls: LocationService, private route: ActivatedRoute) {}

  location: Object;

  ngOnInit() {
    this.location = {};
    this.getLocation();
  }

  getLocation() {
    this.route.params.subscribe(params => {
      const lid = params['id'];
      this.ls.getLocation(lid).subscribe((location: Location) => {
        this.location = location;
      });
    });
  }
}
