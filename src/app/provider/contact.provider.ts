import { Injectable } from '@angular/core';
import { Subject, BehaviorSubject, Observable } from 'rxjs/Rx';
import { Contact } from '../app.model';
import { DbProvider, TABLES } from './db.provider';
import { TokenProvider } from './token.provider';
import { ApiProvider } from './api.provider';
import _ from 'underscore';

interface IContactOpt extends Function {
  (cMap: {[id: string]: Contact}): {[id: string]: Contact};
}
@Injectable()
export class ContactProvider {

  newContact: Subject<Contact> = new Subject();
  contactMap: Observable<{[id: string]: Contact}>;
  contactUpates: Subject<IContactOpt> = new Subject();
  contacts: Subject<Contact[]> = new Subject();


  currentContacts: Subject<Contact[]> = new BehaviorSubject<Contact[]>([])
  contactChange: Subject<Contact> = new Subject<Contact>()
  _contactMap: {[id: string]: Contact} = {}
  revision: number = 0;
  constructor(
    private api: ApiProvider,
    private db: DbProvider,
    token: TokenProvider,
  ){

    //当 token 变化时，推送清除数据操作到 threadUpdates
    token.currentToken.filter(t => {
      return t && t.usable();
    }).map((): IContactOpt => {
      return (map:{[id: string]: Contact}) => {
        return {};
      };
    }).subscribe(this.contactUpates);


    //当 token 变化时，加载数据库数据
    token.currentToken
    .filter(t => t && t.usable())
    .subscribe(() =>{
      this.revision = 0;
      this.db.list(TABLES.Contact)
      .subscribe(rows =>{
        _.chain(rows).forEach(row => {
          let contact = new Contact(row)
          if(contact.revision > this.revision){
            this.revision = contact.revision
          }
          contact._db = true;
          this.newContact.next(contact);
        });
                
      });
    });
  }

  loadData(){
    this._contactMap = {}    
    this.db.list(TABLES.Contact)
    .subscribe(rows =>{
      rows.forEach(row => {
        let contact = new Contact(row)
        this._contactMap[contact.id] = contact
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
    for(let id in this._contactMap){
      let contact = this._contactMap[id]
      if(contact.deletedAt<0){
        contacts.push(contact)
      }
    }
    this.currentContacts.next(contacts)
  }

  private syncContacts(){
    this.listContact(this.revision)
    .subscribe(rsp => {
      if(rsp.code === 0 && rsp.data.length > 0){
        rsp.data.forEach(row => {
          row["id"] = row["userId"]
          let contact = new Contact(row)
          this.contactChange.next(contact)
          this.db.replace(contact,TABLES.Contact)
          this._contactMap[contact.id] = contact
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
    let contact = this._contactMap[id]
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
