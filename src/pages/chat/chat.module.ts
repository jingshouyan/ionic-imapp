import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular/umd';
import { ChatPage } from './chat';

@NgModule({
  declarations: [
    ChatPage,
  ],
  imports: [
    IonicPageModule.forChild(ChatPage),
  ],
})
export class ChatPageModule {}
