import { Injectable } from "@angular/core";
import { SocketProvider } from "./socket.provider";
import { DbProvider, TABLES } from "./db.provider";
import { Msg } from "../app.model";

@Injectable()
export class MessageProvider {

  constructor(
    private socket: SocketProvider,
    private db: DbProvider,
  ){
    socket.newMessage.subscribe(message =>{
      console.log(message)
      let msg = Msg.load(message)
      db.insert(msg,TABLES.Msg)
    })
  }

}