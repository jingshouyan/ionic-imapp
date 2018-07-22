import { Injectable } from "@angular/core";
import { SocketProvider } from "./socket.provider";
import { DbProvider, TABLES } from "./db.provider";
import { Msg, Message } from "../app.model";
import { Subject } from "../../../node_modules/rxjs";

@Injectable()
export class MessageProvider {

  newMessage: Subject<Message> = new Subject<Message>()

  constructor(
    private socket: SocketProvider,
    private db: DbProvider,
  ){
    this.newMessage.subscribe(socket.newMessage)

    this.newMessage.subscribe(message =>{
      console.log(message)
      let msg = Msg.load(message)
      db.insert(msg,TABLES.Msg)
    })
  }

  send(message:Message){
    this.socket.send(message)
  }

}