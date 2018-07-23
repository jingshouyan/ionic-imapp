import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { ThreadProvider } from '../../app/provider/thread.provider';
import { Thread } from '../../app/app.model';
import { ChatPage } from './../chat/chat';

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

  threads: Thread[] = []

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public thread: ThreadProvider,
  ) {
    thread.currentThreads.subscribe(ts => this.threads = ts)
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ThreadPage');
  }

  delete(thread: Thread){
    this.thread.delThread(thread)
  }

  clickItem(thread: Thread){
    this.navCtrl.push(ChatPage,thread)
  }

}
