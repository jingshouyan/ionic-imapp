import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';

import { ContactPage } from '../pages/contact/contact';
import { TabsPage } from '../pages/tabs/tabs';
import { ChatPage } from '../pages/chat/chat';
import { LoginPage } from '../pages/login/login';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { IonicStorageModule } from '@ionic/storage';
import { MePage } from '../pages/me/me';
import { TokenInterceptor } from './app.interceptor';
import { DbProvider } from './provider/db.provider';
import { TokenProvider } from './provider/token.provider';
import { ContactProvider } from './provider/contact.provider';
import { UserProvider } from './provider/user.provider';
import { ApiProvider } from './provider/api.provider';
import { SocketProvider } from './provider/socket.provider';
import { MessageProvider } from './provider/message.provider';
import { RegisterPage } from '../pages/register/register';
import { SearchPage } from '../pages/search/search';
import { UserPage } from '../pages/user/user';
import { ThreadPage } from '../pages/thread/thread';
import { ThreadProvider } from './provider/thread.provider';
import { UserInfoProvoider } from './provider/userInfo.provider';
import { RoomCreatePage } from '../pages/room-create/room-create';
import { RoomProvider } from './provider/room.provider';


@NgModule({
  declarations: [
    MyApp,
    LoginPage,
    RegisterPage,
    TabsPage,
    ThreadPage,
    ContactPage,
    MePage,
    SearchPage,
    UserPage,
    ChatPage,
    RoomCreatePage,
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
    LoginPage,
    RegisterPage,
    TabsPage,
    ThreadPage,
    ContactPage,
    MePage,
    SearchPage,
    UserPage,
    ChatPage,
    RoomCreatePage,
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
    ThreadProvider,
    UserInfoProvoider,
    RoomProvider,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    {provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true },
  ]
})
export class AppModule {}
