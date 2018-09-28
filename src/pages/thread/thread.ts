import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { ThreadProvider } from '../../app/provider/thread.provider';
import { Thread } from '../../app/app.model';
import { ChatPage } from './../chat/chat';
import { Observable } from 'rxjs/Rx';
import { RoomCreatePage } from '../room-create/room-create';

/**
 * Generated class for the ThreadPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-thread',
  templateUrl: 'thread.html',
})
export class ThreadPage {

  threads: Observable<Thread[]>;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public thread: ThreadProvider,
  ) {
    this.threads = thread.threads;
  }

  ionViewDidLoad() {
  }

  delete(thread: Thread){
    this.thread.delThread(thread)
  }

  clickItem(thread: Thread){
    this.navCtrl.push(ChatPage,thread)
  }

  p(thread: Thread){
    if(thread.draft){
      return "[草稿] "+thread.draft
    }
    return thread.latestMessage
  }

  room(){
    this.navCtrl.push(RoomCreatePage);
  }

}
