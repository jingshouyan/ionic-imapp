import { Component } from '@angular/core';

import { ContactPage } from '../contact/contact';
import { MePage } from '../me/me';
import { ChatPage } from '../chat/chat';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {

  threadTab =   {title:"Chat",root:ChatPage,icon:"chatboxes",badge:0,badgeStyle:"danger"};
  contactTab =  {title:"Contact",root:ContactPage,icon:"contacts",badge:0,badgeStyle:"danger"};
  myTab =       {title:"Me",root:MePage,icon:"person",badge:0,badgeStyle:"danger"};


  tabs: any[] = [
    this.threadTab,
    this.contactTab,
    this.myTab,
  ];

  constructor() {    
  }
}
