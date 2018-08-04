import { Injectable } from "@angular/core";
import { DbProvider, TABLES } from "./db.provider";
import { TokenProvider } from "./token.provider";
import { Thread, Message ,Token } from "../app.model";
import { MessageProvider } from "./message.provider";
import { Subject, BehaviorSubject, Observable } from 'rxjs/Rx';
import { ContactProvider } from "./contact.provider";
import { UserProvider } from './user.provider';
import _ from 'underscore';
@Injectable()
export class ThreadProvider {

  private threadCache: {[id: string]: Thread} = {}
  currentThreads: Subject<Thread[]> = new BehaviorSubject<Thread[]>([])
  private token : Token = new Token;


  constructor(
    private db :DbProvider,
    token: TokenProvider,
    private message: MessageProvider,
    contact: ContactProvider,
    user: UserProvider,
  ){
    token.currentToken.subscribe(token =>{
      if(token && token.usable()){
        this.token = token;
        this.loadData()
        .then(v =>{
          console.log("thread provider inited")
          //订阅新消息
          message.newMessage.subscribe(msg =>{
            console.log("thread on message",msg)
            let targetId = msg.targetId
            let targetType = msg.targetType
            //单聊 以对方为 目标
            if(targetType == 'user' && targetId == token.userId){
              targetId = msg.senderId
            }
            let msgCtx = this.msgCtx(msg)
            let tid = msg.threadId
            let t = this.threadCache[tid]
            //获取缓存会话信息
            if(t){
              msgCtx && (t.latestTime = msg.localTime)
              msgCtx && (t.latestMessage = msgCtx)
              t.unread = (msg.senderId != token.userId) && (t.unread + 1) || 0
              this.pushThread(t)
            }
            else if(msgCtx) { //缓存中没有会话，并且信息需要展示
              if(targetType == 'user'){
                let c = contact.getContact(targetId)//取联系人信息
                if(c){
                  let thread = new Thread({
                    name: c.nickname,
                    remack: c.remark,
                    icon: c.icon,
                    latestMessage: msgCtx,
                    latestTime: msg.localTime,
                    targetId: targetId,
                    targetType: targetType
                  })
                  thread.unread = (msg.senderId != token.userId) && (thread.unread + 1) || 0
                  this.pushThread(thread)
                }
                else { //不再联系人中
                  user.getUserCache(targetId)                  
                  .subscribe(u =>{
                    let thread = new Thread({
                      name: u && u.nickname || targetId,
                      icon: u && u.icon || '',
                      latestMessage: msgCtx,
                      latestTime: msg.localTime,
                      targetId: targetId,
                      targetType: targetType
                    })
                    thread.unread = (msg.senderId != token.userId) && (thread.unread + 1) || 0
                    this.pushThread(thread)
                  })
                }
              }
            }
          })

          //订阅联系人变化
          contact.contactChange.subscribe(c =>{
            let tid = Thread.tid(c.id,"user")
            let t = this.threadCache[tid]
            if(t && !c.deleted &&(t.name != c.nickname || t.remark != c.remark)){
              t.name = c.nickname
              t.remark = c.remark
              this.pushThread(t)
            }
          })

          //订阅用户变化
          user.cacheChange.subscribe(u =>{
            let tid = Thread.tid(u.id,"user")
            let t = this.threadCache[tid]
            if(t && t.name != u.nickname){
              t.name = u.nickname
              this.pushThread(t)
            }
          })

        })        
      }
    })

  }


  private msgCtx(msg: Message){
    let msgCtx = ""
    switch(msg.messageType){      
      case "text": 
        msgCtx = msg.text.content
        break;
    }
    return msgCtx
  }

  getThread(thread: Thread){
    let t = this.threadCache[thread.id]
    if(!t){
      this.pushThread(thread)
    }
    return t || thread
  }

  pushThread(thread: Thread){
    this.threadCache[thread.id] = thread
    this.db.replace(thread,TABLES.Thread)
    this.nextThreads()
  }

  private nextThreads(){
    let threads: Thread[] = []
    for (const key in this.threadCache) {
      if (this.threadCache.hasOwnProperty(key)) {
        const thread = this.threadCache[key];
        threads.push(thread)
      }
    }
    threads.sort((a,b) => {
      return b.latestTime - a.latestTime
    })
    this.currentThreads.next(threads)
  } 


  private loadData(){
    return this.db.list(TABLES.Thread).then(rows =>{
      rows.forEach(row =>{
        let thread = new Thread(row)
        this.threadCache[thread.id] = thread
      })
      this.nextThreads()
    })
  }

  delThread(thread: Thread){
    delete this.threadCache[thread.id]
    this.db.delete(TABLES.Thread,thread)
    this.nextThreads()
  }


  threadMessages(tid: string): Observable<Message[]>{
    return this.message.messages.map((messages: Message[]) => {
      return _.chain(messages)
      .filter(message => message.tid(this.token.userId) === tid)
      .value();
    })
  }

  threadMessage(tid: string){
    return this.message.newMessage.filter(message => message.threadId == tid)
  }

  pullMessage(tid:string,timestamp: number ,size: number = 100): Observable<Message>{
    let pull: Subject<Message> = new Subject<Message>()
    this.db.list(TABLES.Msg,"threadId = ? and sentAt < ? order by sentAt desc limit 0, ?",[tid,timestamp,size])
    .then(rows =>{
      _.chain(rows).forEach(row =>{
        let message = Message.load(row);
        pull.next(message);
      });
    });
    return pull;
  }


}