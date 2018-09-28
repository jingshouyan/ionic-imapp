import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, TextInput, Content } from 'ionic-angular';
import { Message, Thread } from '../../app/app.model';
import { MessageProvider } from './../../app/provider/message.provider';
import { ThreadProvider } from '../../app/provider/thread.provider';
import { TokenProvider } from '../../app/provider/token.provider';
import { UserInfo } from './../../app/app.model';
import { UserInfoProvoider } from './../../app/provider/userInfo.provider';
import _ from 'underscore';
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
  @ViewChild("scoll")
  scoll: Content


  thread: Thread;

  messages: Message[] = [];

  uInfoMap: {[id: string]: UserInfo} = {};

  //存储未完成的消息
  mmap: {[localId: string]: Message} = {};

  myId: string = "";

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public messageProvider: MessageProvider,
    public threadProvider: ThreadProvider,
    public tokenProvider: TokenProvider,
    public userInfoProvoider: UserInfoProvoider,
  ) {
    this.thread = new Thread(navParams.data)
    threadProvider.getThread(this.thread.id)
    .subscribe(t => this.thread = t);

    threadProvider.threadMessage(this.thread.id)
    .subscribe(message =>{
      this.uInfo(message.senderId);
      let m = this.mmap[message.localId];
      if (!m) {
        this.messages.push(message);
        if(message.state !== 0){
          this.mmap[message.localId] = message;
        }
      } else {
        m = Object.assign(m,message);
        if(message.state === 0) {
          delete this.mmap[message.localId];
        }
      }

      this.onMessageScroll();
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
      .do(x => console.log('chat x',x))
      .subscribe(uinfo =>{
        this.uInfoMap[uinfo.id] = uinfo;
      });
    }
  }

 

  ionViewDidLoad() {
    this.pull(true);
  }

  ionViewWillEnter(){
    // this.scrollToBottom();
  }

  ionViewWillLeave(){
    this.thread.unread = 0;
    this.threadProvider.newThread.next(this.thread);
    console.log('触发ionViewWillLeave');
  }

  ionViewDidLeave(){
    console.log('触发ionViewDidLeave');
  }

  ionViewWillUnload(){
    console.log('触发ionViewWillUnload');
  }


  pull(first:boolean = false){

    let timestamp = new Date().getTime()+ 24*60*60*1000;
    if(this.messages.length>0){
      timestamp = this.messages[0].sentAt ;
    }
    this.threadProvider.pullMessage(this.thread.id,timestamp)
    .subscribe(messages =>{
      _.chain(messages).forEach(message =>{
        this.uInfo(message.senderId);
        this.messages.unshift(message);
        if(message.state !== 0) {
          this.mmap[message.localId] = message;
        }
      })
      if(first){
        setTimeout(() => {
          this.scrollToBottom();
        }, 0);
      }
    });
  }

  me(message: Message): boolean{
    return message.senderId === this.myId;
  }

  sendTextMessage(){
    if(!this.thread.draft){
      return false;
    }
    let message = new Message({
      targetId:this.thread.targetId,
      targetType: this.thread.targetType,
      messageType: "text",
      text: {content: this.thread.draft}
    })
    this.thread.draft = ""
    this.messageProvider.send(message).subscribe(rsp => {
      this.scrollToBottom();
    })
  }

  scrollToBottom(): void {
    let dim = this.scoll.getContentDimensions();
    // console.log(dim);
    this.scoll.scrollTo(0,dim.scrollHeight,0);
    // this.scoll.scrollToBottom();
  }

  onMessageScroll(){
    let dim = this.scoll.getContentDimensions();
    let scrollHeight = dim.scrollHeight;
    let scrollTop = dim.scrollTop;
    let contentHeight = dim.contentHeight;
    // console.log(dim);
    if(scrollHeight-(scrollTop+contentHeight)<100){
      this.scrollToBottom();
    }
  }

}
