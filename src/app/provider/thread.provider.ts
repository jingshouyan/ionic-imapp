import { Injectable } from "@angular/core";
import { DbProvider, TABLES } from "./db.provider";
import { TokenProvider } from "./token.provider";
import { Thread, Message ,Token } from "../app.model";
import { MessageProvider } from "./message.provider";
import { Subject, Observable, BehaviorSubject } from 'rxjs/Rx';
import _ from 'underscore';
import { UserInfoProvoider } from "./userInfo.provider";

interface IThreadOpt extends Function {
  (tMap: {[id: string]: Thread}): {[id: string]: Thread};
}
@Injectable()
export class ThreadProvider {
  private token : Token = new Token;

  newThread: Subject<Thread> = new Subject();
  threadMap: Observable<{[id: string]: Thread}>;
  threadUpdates: Subject<IThreadOpt> = new Subject();
  threads: Subject<Thread[]> = new BehaviorSubject([]);

  constructor(
    private db :DbProvider,
    token: TokenProvider,
    uInfo: UserInfoProvoider,
    private message: MessageProvider,
  ){

    this.threads.subscribe(ts => console.log("threads change!!",ts))

    // update 流 计算得到 threadMap
    this.threadMap = this.threadUpdates
    .scan((tMap:{[id: string]: Thread},opt: IThreadOpt) =>{
      return opt(tMap);
    },{}).publishReplay(1).refCount();

    // threadMap 流转换为 threads
    this.threadMap.combineLatest(uInfo.uInfoMap.debounceTime(50),(tmap,imap) =>{

      _.forEach(tmap,(t) =>{
        if(t.targetType === 'user'){
          let i = imap[t.targetId];
          if(i){
            t.name = i.name();
            t.icon = i.avatar();
          }
        }
      })
      return tmap;
    })
    .map(tMap => {
      return _.map(tMap,t=>t)
      .sort((a,b) => b.latestTime - a.latestTime);      
    }).subscribe(this.threads);

    this.threadMap.subscribe(t => console.log("thread map",t));

    //当 token 变化时，推送清除数据操作到 threadUpdates
    token.tokenChange.map((): IThreadOpt => {
      return (map:{[id: string]: Thread}) => {
        return {};
      };
    })
    .subscribe(this.threadUpdates);

    //newThread 流 推送到 threadUPdates
    this.newThread.map((t): IThreadOpt =>{
      return (map:{[id: string]: Thread}) => {        
        let thread = map[t.id];
        console.info("update ",map,t,thread);
        if(thread) {
          if(t.unread) {
            t.unread = t.unread + thread.unread;
          }
          if(!t.draft && thread.draft) {
            t.draft = thread.draft;
          }
          if(t.latestTime < thread.latestTime){
            t.latestTime = thread.latestTime;
          }
          if(!t.latestMessage && thread.latestMessage){
            t.latestMessage = thread.latestMessage;
          }
        }
        if(!t._db){
          //不是从数据库中读取的需要存储到数据库中
          this.db.replace(t,TABLES.Thread)
          .subscribe((res) =>{});
        }
        map[t.id] = t;
        return map;
      };
    })
    .subscribe(this.threadUpdates);



    token.tokenChange
    .subscribe(t => {
      this.token = t;
      //从数据库中读取 thread 推送到 newThread
      this.db.list(TABLES.Thread).flatMap(rows => {
        return Observable.from(rows);
      })
      .map(row => {
        let t = new Thread(row);
        t._db = true;
        return t;
      })
      .subscribe(t => this.newThread.next(t));
    });

    //消息流推送到 newThread
    this.message.newMessage.map(message => {
      let t = this.token;
      let targetId = message.targetId == t.userId ? message.senderId : message.targetId;
      let unread = message.targetId == t.userId ? 1: 0;
      let msgCtx = this.msgCtx(message);
      let thread = new Thread({
        latestMessage: msgCtx,
        latestTime: message.sentAt,
        targetId: targetId,
        targetType: message.targetType,
        unread: unread,
      });
      console.info("new message to new thread",message,thread);
      return thread;
    })
    // TODO: 多个 subscribe(this.newTread) 只有一个生效，why ?
    .subscribe(this.newThread);
  

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

  getThread(tid: string){
    return this.threadMap
    .map(tmap => tmap[tid])
    .filter(t => !!t);
  }

  delThread(thread: Thread){
    this.db.delete(TABLES.Thread,thread).subscribe();
    this.threadUpdates.next((map) => {
      delete map[thread.id];
      map = Object.assign({},map);
      return map;
    });
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

  pullMessage(tid:string,timestamp: number ,size: number = 100): Observable<Message[]>{
    let obs = this.db.list(TABLES.Msg,"threadId = ? and sentAt < ? order by sentAt desc limit 0, ?",[tid,timestamp,size])
    .map(rows => {
      let messages = _.chain(rows).map(row => Message.load(row)).value();
      return messages;
    });
    return obs;
  }


}