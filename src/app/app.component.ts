import { Component, Injectable, OnInit, ViewEncapsulation } from '@angular/core';
import { AuthService } from './auth/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  encapsulation: ViewEncapsulation.None
})

@Injectable()
export class AppComponent implements OnInit {
  title = 'fitness-tracker-app';
  openSidenav = false;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.authService.initAuthListener()
  }
}


