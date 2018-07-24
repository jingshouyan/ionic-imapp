import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Message, Thread, Token } from '../../app/app.model';
import { MessageProvider } from './../../app/provider/message.provider';
import { TokenProvider } from '../../app/provider/token.provider';

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
    public message: MessageProvider,
    token: TokenProvider,
  ) {
    this.thread = new Thread(navParams.data)
    token.currentToken.subscribe(t =>{
      console.error("chat token",t)
      this.token = t
      let i = 0
      let message = new Message({
        senderId: this.token.userId,
        targetId:this.thread.targetId,
        targetType: this.thread.targetType,
        messageType: "text",
        text: {content: "heehda"}
      })
      // setInterval(()=>{
        i++
        message.text.content = this.thread.name+":"+i
        this.message.send(message)
      // },1000)
    })
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ChatPage');

    
  }

}
