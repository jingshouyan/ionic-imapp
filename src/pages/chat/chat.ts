import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, TextInput } from 'ionic-angular';
import { Message, Thread } from '../../app/app.model';
import { MessageProvider } from './../../app/provider/message.provider';
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

  messages: Message[] = [];

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public messageProvider: MessageProvider,
    public threadProvider: ThreadProvider,
  ) {
    let t = new Thread(navParams.data)
    this.thread = threadProvider.getThread(t)
    this.pull()
    threadProvider.threadMessage(this.thread.id)
    .subscribe(message =>{
      console.log(message)
      this.messages.push(message);
    });
  }

  ionViewDidLoad() {
    Observable.fromEvent(this.textInput.getNativeElement(),"keyup")
    .map((e:any) => e.target.value)
    .debounceTime(300)
    .subscribe(value =>{
      this.threadProvider.pushThread(this.thread)
    })
  }

  pull(){
    let timestamp = new Date().getTime();
    if(this.messages.length>0){
      timestamp = this.messages[0].sentAt;
    }
    this.threadProvider.pullMessage(this.thread.id,timestamp)
    .subscribe(message =>{
      this.messages.unshift(message);
    });
  }

  sendTextMessage(){
    let message = new Message({
      targetId:this.thread.targetId,
      targetType: this.thread.targetType,
      messageType: "text",
      text: {content: this.thread.draft}
    })
    this.thread.draft = ""
    this.messageProvider.send(message).subscribe(rsp => {})
  }

}
