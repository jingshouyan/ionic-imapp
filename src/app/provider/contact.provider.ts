import { Injectable } from '@angular/core';
import { Subject, BehaviorSubject } from 'rxjs/Rx';
import { Contact } from '../app.model';
import { DbProvider, TABLES } from './db.provider';
import { TokenProvider } from './token.provider';
import { ApiProvider } from './api.provider';

@Injectable()
export class ContactProvider {

  currentContacts: Subject<Contact[]> = new BehaviorSubject<Contact[]>([])
  contactChange: Subject<Contact> = new Subject<Contact>()
  contactMap: {[id: string]: Contact} = {}
  revision: number = 0
  constructor(
    private api: ApiProvider,
    private db: DbProvider,
    token: TokenProvider,
  ){
    token.currentToken.subscribe(token =>{
      if(token && token.usable()){
        this.loadData()
      }
    })
  }

  loadData(){
    this.contactMap = {}    
    this.db.list(TABLES.Contact)
    .subscribe(rows =>{
      rows.forEach(row => {
        let contact = new Contact(row)
        this.contactMap[contact.id] = contact
        this.contactChange.next(contact)
        if(contact.revision > this.revision){
          this.revision = contact.revision
        }
      })
      this.pushContacts()
      this.syncContacts()
    })

  }

  private pushContacts(){
    let contacts: Contact[] = []
    for(let id in this.contactMap){
      let contact = this.contactMap[id]
      if(contact.deletedAt<0){
        contacts.push(contact)
      }
    }
    console.log("push contacts",contacts)
    this.currentContacts.next(contacts)
  }

  private syncContacts(){
    this.listContact(this.revision)
    .subscribe(rsp => {
      console.log(rsp)
      if(rsp.code === 0 && rsp.data.length > 0){
        rsp.data.forEach(row => {
          row["id"] = row["userId"]
          let contact = new Contact(row)
          this.contactChange.next(contact)
          this.db.replace(contact,TABLES.Contact)
          this.contactMap[contact.id] = contact
          if(contact.revision > this.revision){
            this.revision = contact.revision
          }
        })
        this.pushContacts()
      }
    })
  }


  private listContact(revision) {
    let endpoint = "relationship/ListContact.json"
    return this.api.post(endpoint,{revision: revision})    
  }

  getContact(id: string): Contact{
    let contact = this.contactMap[id]
    if(contact && !contact.deleted()){
      return contact
    }
    return undefined
  }

  addContact(opt: any){
    let endpoint = "relationship/AddContact.json"
    return this.api.post(endpoint,{userId: opt.userId,remark: opt.remark,type: opt.type})
    .map(rsp =>{
      if(rsp.code === 0){
        this.syncContacts()
      }
      return rsp
    })
  }

  delContact(id: string){
    let endpoint = "relationship/DelContact.json"
    return this.api.post(endpoint,{userId:id})
    .map(rsp=>{
      if(rsp.code === 0){
        this.syncContacts()
      }
      return rsp
    })
  }
}
