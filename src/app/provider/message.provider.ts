import { Injectable } from "@angular/core";
import { SocketProvider } from "./socket.provider";
import { DbProvider, TABLES } from "./db.provider";
import { Msg, Message, Rsp } from "../app.model";
import { Subject } from 'rxjs/Rx';

@Injectable()
export class MessageProvider {

  newMessage: Subject<Message> = new Subject<Message>()

  constructor(
    private socket: SocketProvider,
    private db: DbProvider,
  ){
    socket.newMessage.subscribe(this.newMessage)

    this.newMessage.subscribe(message =>{
      console.log(message)
      let msg = Msg.load(message)
      db.insert(msg,TABLES.Msg)
    })
  }

  send(message: Message){
    message.id = message.localId
    message.state = 1
    this.newMessage.next(message)
    return this.socket.send(message).map(r =>{
      let rsp = new Rsp(r)
      this.db.delete(TABLES.Msg,message)
      if(rsp.code === 0){
        let msg = new Message(rsp.data)
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