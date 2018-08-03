import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, TextInput } from 'ionic-angular';
import { Message, Thread, Token } from '../../app/app.model';
import { MessageProvider } from './../../app/provider/message.provider';
import { TokenProvider } from '../../app/provider/token.provider';
import { ThreadProvider } from '../../app/provider/thread.provider';
import { Observable } from 'rxjs/Rx';

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

  @ViewChild("textInput")
  textInput: TextInput

  thread: Thread
  token: Token

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public messageProvider: MessageProvider,
    public tokenProvider: TokenProvider,
    public threadProvider: ThreadProvider,
  ) {
    let t = new Thread(navParams.data)
    this.thread = threadProvider.getThread(t)
    tokenProvider.currentToken.subscribe(t =>{
      this.token = t
    })
  }

  ionViewDidLoad() {
    Observable.fromEvent(this.textInput.getNativeElement(),"keyup")
    .map((e:any) => e.target.value)
    .debounceTime(300)
    .subscribe(value =>{
      this.threadProvider.pushThread(this.thread)
    })
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
