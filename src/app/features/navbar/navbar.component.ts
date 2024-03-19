import { NgClass } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatToolbar } from '@angular/material/toolbar';
import {MatTooltip} from '@angular/material/tooltip'

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [MatToolbar, MatIcon, MatButtonModule, NgClass, MatTooltip],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  alignClass = 'd-flex align-items-center gap-2'

  @Output() toggleSidebar = new EventEmitter<void>();
  
}
