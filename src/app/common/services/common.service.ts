import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CommonService {

  constructor() { }

  toggleHamburger(lid) {
    var hamburger = document.getElementById('hamburger' + lid);
    hamburger.classList.toggle("is-active");
  }
}
