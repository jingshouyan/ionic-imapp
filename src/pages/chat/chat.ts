import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Message, Thread, Token } from '../../app/app.model';
import { MessageProvider } from './../../app/provider/message.provider';
import { TokenProvider } from '../../app/provider/token.provider';
import { ThreadProvider } from '../../app/provider/thread.provider';

/**
 * Generated class for the ChatPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-chat',
  templateUrl: 'chat.html',
})
export class ChatPage {

  thread: Thread
  token: Token

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public messageProvider: MessageProvider,
    token: TokenProvider,
    threadProvider: ThreadProvider,
  ) {
    let t = new Thread(navParams.data)
    this.thread = threadProvider.getThread(t)
    token.currentToken.subscribe(t =>{
      this.token = t
    })
  }

  ionViewDidLoad() {

    
  }

  sendTextMessage(){
    let message = new Message({
      senderId: this.token.userId,
      targetId:this.thread.targetId,
      targetType: this.thread.targetType,
      messageType: "text",
      text: {content: this.thread.draft}
    })
    this.thread.draft = ""
    this.messageProvider.send(message).subscribe(rsp => {})
  }

}
