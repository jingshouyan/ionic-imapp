import { Component } from '@angular/core';

import { ContactPage } from '../contact/contact';
import { MePage } from '../me/me';
import { ThreadPage } from '../thread/thread';
import { ThreadProvider } from '../../app/provider/thread.provider';
import _ from 'underscore';
import { UserProvider } from '../../app/provider/user.provider';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {

  threadTab =   {title:"消息",root:ThreadPage,icon:"chatboxes",badge:0,badgeStyle:"danger"};
  contactTab =  {title:"联系人",root:ContactPage,icon:"contacts",badge:0,badgeStyle:"danger"};
  myTab =       {title:"我",root:MePage,icon:"person",badge:0,badgeStyle:"danger"};


  tabs: any[] = [
    this.threadTab,
    this.contactTab,
    this.myTab,
  ];

  constructor(
    thread: ThreadProvider,
    user: UserProvider,
  ) {
    thread.threads.map(ts => {
      console.info(ts);
      return _.chain(ts)
      .map(t => t.unread)
      .reduce((sum,unread)=> sum+unread,0)
      .value();
    }).subscribe(unread => this.threadTab.badge = unread);    

    user.uMap(["10002","10003"]).subscribe(r => {
      console.info("umap",r);
    })

  }
}
