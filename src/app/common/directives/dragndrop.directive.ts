import { Directive, Output, EventEmitter, HostListener } from '@angular/core';

@Directive({
  selector: '[appDragndrop]'
})
export class DragndropDirective {

  @Output() dropped = new EventEmitter<FileList>();
  @Output() hovered = new EventEmitter<boolean>();

  constructor() { }

  /**
   * Checks for a file drop event and sets the dropzone variables.
   *
   * @param $event - Drop event for the dropzone.
   */
  @HostListener('drop', ['$event'])
  onDrop($event) {
    $event.preventDefault();
    this.dropped.emit($event.dataTransfer.files);
    this.hovered.emit(false);
  }

  /**
   * Checks for a dragover event and sets the dropzone variables.
   *
   * @param $event - Dragover event for the dropzone.
   */
  @HostListener('dragover', ['$event'])
  onDragOver($event) {
    $event.preventDefault();
    this.hovered.emit(true);
  }

  /**
   * Checks for a dragleave event and sets the dropzone variables.
   *
   * @param $event - Dragleave event for the dropzone.
   */
  @HostListener('dragleave', ['$event'])
  onDragLeave($event) {
    $event.preventDefault();
    this.hovered.emit(false);
  }


}
