import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular/umd';
import { MessageProvider } from '../../app/provider/message.provider';
import { Message } from '../../app/app.model';

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

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public message: MessageProvider,
  ) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ChatPage');
    let message = new Message({
      targetId:"123123",
      targetType: "user",
      messageType: "text",
      text: {content: "heehda"}
    })
    // setInterval(()=>{
    //   this.message.send(message)
    // },10)
    
  }

}
