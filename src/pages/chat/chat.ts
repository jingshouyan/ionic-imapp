import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Message, Thread } from '../../app/app.model';
import { MessageProvider } from './../../app/provider/message.provider';

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

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public message: MessageProvider,
  ) {
    this.thread = new Thread(navParams.data)
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ChatPage');
    let i = 0
    let message = new Message({
      targetId:"123123",
      targetType: "user",
      messageType: "text",
      text: {content: "heehda"}
    })
    // setInterval(()=>{
    //   i++
    //   message.text.content = this.thread.name+":"+i
    //   this.message.send(message)
    // },1000)
    
  }

}
