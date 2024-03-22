import { Component } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Device } from '@capacitor/device';
import { DatabaseService } from './services/database.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  public isWeb: boolean;
  public load: boolean;

  constructor(
    private platform: Platform,
    private databaseService: DatabaseService
  ) {
    this.isWeb = false;
    this.load = false;
    this.initApp();
  }

  initApp() {
    this.platform.ready().then(async () => {
      const info = await Device.getInfo();
      this.isWeb = info.platform == 'web';

      this.databaseService.init();
      this.databaseService.dbready.subscribe((ready) => {
        this.load = ready;
      });
    });
  }
}
