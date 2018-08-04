import { Component, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { IonicPage, NavController, NavParams, TextInput } from 'ionic-angular';
import { Message, Thread } from '../../app/app.model';
import { MessageProvider } from './../../app/provider/message.provider';
import { ThreadProvider } from '../../app/provider/thread.provider';
import { Observable } from 'rxjs/Rx';
import { TokenProvider } from '../../app/provider/token.provider';
import { UserInfo } from './../../app/app.model';
import { UserInfoProvoider } from './../../app/provider/userInfo.provider';

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

  uInfoMap: {[id: string]: UserInfo} = {};

  myId: string = "";

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public messageProvider: MessageProvider,
    public threadProvider: ThreadProvider,
    public tokenProvider: TokenProvider,
    public userInfoProvoider: UserInfoProvoider,
  ) {
    let t = new Thread(navParams.data)
    this.thread = threadProvider.getThread(t);
    this.pull();
    threadProvider.threadMessage(this.thread.id)
    .subscribe(message =>{
      this.uInfo(message.senderId);
      this.messages.push(message);
    });
    tokenProvider.currentToken.subscribe(t =>{
      if(t && t.usable){
        this.myId = t.userId;
      }
    });
  }

  uInfo(id: string){
    let u = this.uInfoMap[id] || new UserInfo;
    if(!u.id){
      u.id = id;
      this.uInfoMap[id] = u;
      this.userInfoProvoider.getUserInfo(id)
      .subscribe(uinfo =>{
        this.uInfoMap[uinfo.id] = uinfo;
        console.log(this.uInfoMap);
      });
    }
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
      this.uInfo(message.senderId);
      this.messages.unshift(message);
    });
  }

  me(message: Message): boolean{
    return message.senderId === this.myId;
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
