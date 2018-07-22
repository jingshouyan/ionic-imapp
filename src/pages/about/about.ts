import { Component } from '@angular/core';
import { NavController, Events, FabContainer } from 'ionic-angular/umd';

@Component({
  selector: 'page-about',
  templateUrl: 'about.html'
})
export class AboutPage {

  constructor(public navCtrl: NavController,
    public events: Events,
  ) {
    console.log('about.');
    events.subscribe('eee',(str)=>{
      console.log(str);
    })
    console.log('触发构造函数');
  }

  share(str: string,m: FabContainer){
    console.log(str,m);
    m.close();
  }


  ionViewDidLoad(){
    console.log('触发ionViewDidLoad');
}

ionViewWillEnter(){
    console.log('触发ionViewWillEnter');
}

ionViewDidEnter(){
    console.log('触发ionViewDidEnter');
}

ionViewWillLeave(){
    console.log('触发ionViewWillLeave');
}

ionViewDidLeave(){
    console.log('触发ionViewDidLeave');
}

ionViewWillUnload(){
    console.log('触发ionViewWillUnload');
}



}
