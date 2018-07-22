import { Component } from '@angular/core';
import { Platform } from 'ionic-angular/umd';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { TabsPage } from '../pages/tabs/tabs';
import { LoginPage } from '../pages/login/login';
import { TokenProvider } from './provider/token.provider';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage:any;

  constructor(platform: Platform, 
    statusBar: StatusBar, 
    splashScreen: SplashScreen,
    tokenProvider: TokenProvider,
  ) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      splashScreen.hide();
      tokenProvider.currentToken.subscribe(token => {
        console.log('app token subscribe',token)
        if(token){
          if(token.usable()){
            this.rootPage = TabsPage
          }else{
            this.rootPage = LoginPage
          }
        }
        
      })
    });
  }

}
