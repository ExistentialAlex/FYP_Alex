import { Injectable } from '@angular/core';
import { Location } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class CommonService {

  constructor(private location: Location) { }

  toggleHamburger(lid) {
    const hamburger = document.getElementById('hamburger' + lid);
    hamburger.classList.toggle('is-active');
  }

  goBack() {
    this.location.back();
  }
}
