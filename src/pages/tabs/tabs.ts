import { Component } from '@angular/core';

import { ContactPage } from '../contact/contact';
import { ChatPage } from '../chat/chat';
import { MePage } from './../me/me';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {

  chatTab = {title:"Chat",root:ChatPage,icon:"chatboxes",badge:"1",badgeStyle:"danger"};
  contactTab = {title:"Contact",root:ContactPage,icon:"contacts",badge:"",badgeStyle:"danger"};
  myTab = {title:"Me",root:MePage,icon:"person",badge:"",badgeStyle:"danger"};


  tabs: any[] = [
    this.chatTab,
    this.contactTab,
    this.myTab,
  ];

  constructor() {    
  }
}
