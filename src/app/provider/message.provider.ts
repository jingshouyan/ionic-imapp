import { Injectable } from "@angular/core";
import { SocketProvider } from "./socket.provider";
import { DbProvider, TABLES } from "./db.provider";
import { Msg, Message, Rsp } from "../app.model";
import { Subject, Observable } from 'rxjs/Rx';
import { TokenProvider } from "./token.provider";
import { Token } from './../app.model';



let initialMessages: Message[] = [];
interface IMessagesOperation extends Function {
(messages: Message[]): Message[];
}

@Injectable()
export class MessageProvider {

  newMessage: Subject<Message> = new Subject<Message>()

  messages: Observable<Message[]>;

  updates: Subject<any> = new Subject<any>();

  create: Subject<Message> = new Subject<Message>()

  token: Token = new Token;

  constructor(
    private socket: SocketProvider,
    private db: DbProvider,
    token: TokenProvider,
  ){
    token.currentToken.subscribe(t=>{
      if(t && t.usable()){
        this.token = t;
      }
    });
    socket.newMessage.subscribe(this.newMessage)

    this.newMessage.subscribe(message =>{
      console.log(message)
      let msg = Msg.load(message)
      db.insert(msg,TABLES.Msg)
    })

    this.messages = this.updates
    .scan((messages: Message[],operation: IMessagesOperation) => {
      return operation(messages);
    },initialMessages)
    .publishReplay(1).refCount();

    this.create
    .map(message => ((messages: Message[]) => messages.concat(message)))
    .subscribe(this.updates);

    this.newMessage.subscribe(this.create)
  }


  send(message: Message){
    message.id = message.localId
    message.senderId = this.token.userId;
    message.threadId = message.tid(this.token.userId);
    message.state = 1
    // this.newMessage.next(message)
    return this.socket.send(message).map(r =>{
      let rsp = new Rsp(r)
      this.db.delete(TABLES.Msg,message)
      if(rsp.code === 0){
        let msg = new Message(rsp.data)
        msg.threadId = msg.tid(this.token.userId);
        msg.localId = message.localId
        this.newMessage.next(msg)
      }
      else{
        message.state = 2
        this.newMessage.next(message)
      }
      return rsp
    })
  }

}