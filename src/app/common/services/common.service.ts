import { Injectable } from '@angular/core';
import { Location } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class CommonService {

  constructor(private location: Location) { }

  /**
   * Toggles the Hamburger icon for a specific element.
   *
   * @param id - The ID of the element to be toggled.
   */
  // Allows the use of 'Hamburgers' throughout the project.
  toggleHamburger(id) {
    const hamburger = document.getElementById('hamburger' + id);
    hamburger.classList.toggle('is-active');
  }

  /**
   * Returns the user to the previous routing location.
   */
  goBack(): void {
    return this.location.back();
  }
}
