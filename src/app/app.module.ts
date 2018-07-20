import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';

import { AboutPage } from '../pages/about/about';
import { ContactPage } from '../pages/contact/contact';
import { HomePage } from '../pages/home/home';
import { TabsPage } from '../pages/tabs/tabs';
import { ChatPage } from './../pages/chat/chat';
import { LoginPage } from './../pages/login/login';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { IonicStorageModule } from '@ionic/storage';
import { MePage } from '../pages/me/me';
import { TokenInterceptor } from './app.interceptor';
import { DbProvider } from './provider/db.provider';
import { TokenProvider } from './provider/token.provider';
import { ContactProvider } from './provider/contact.provider';
import { UserProvider } from './provider/user.provider';
import { ApiProvider } from './provider/aip.provider';
import { SocketProvider } from './provider/socket.provider';
import { MessageProvider } from './provider/message.provider';
import { RegisterPage } from '../pages/register/register';

@NgModule({
  declarations: [
    MyApp,
    TabsPage,
    ChatPage,
    ContactPage,
    MePage,
    LoginPage,
    AboutPage,
    HomePage,
    RegisterPage,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    IonicModule.forRoot(MyApp,{
      tabsHideOnSubPages: 'true'
    }),
    IonicStorageModule.forRoot(),
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,    
    TabsPage,
    ChatPage,
    ContactPage,
    MePage,
    LoginPage,
    HomePage,
    AboutPage,
    RegisterPage,
  ],
  providers: [
    StatusBar,
    SplashScreen,
    ApiProvider,
    DbProvider,
    TokenProvider,
    UserProvider,
    ContactProvider,
    SocketProvider,
    MessageProvider,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    {provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true },
  ]
})
export class AppModule {}
