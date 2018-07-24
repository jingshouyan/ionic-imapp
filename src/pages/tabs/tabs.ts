import { Component } from '@angular/core';

import { ContactPage } from '../contact/contact';
import { MePage } from '../me/me';
import { ThreadPage } from '../thread/thread';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {

  threadTab =   {title:"呵呵",root:ThreadPage,icon:"chatboxes",badge:0,badgeStyle:"danger"};
  contactTab =  {title:"联系人",root:ContactPage,icon:"contacts",badge:0,badgeStyle:"danger"};
  myTab =       {title:"我",root:MePage,icon:"person",badge:0,badgeStyle:"danger"};


  tabs: any[] = [
    this.threadTab,
    this.contactTab,
    this.myTab,
  ];

  constructor() {    
  }
}
