import { Injectable } from "@angular/core";
import { TokenProvider } from "./token.provider";
import { Socket } from 'ng-socket-io';
import { Message, Rsp } from '../app.model';
import { Subject, BehaviorSubject } from 'rxjs/Rx';


@Injectable()
export class SocketProvider {

  newMessage: Subject<Message> = new Subject<Message>()
  conn: Subject<boolean> = new BehaviorSubject<boolean>(false)

  private baseUrl: string = "http://47.94.13.229?ticket="
  private socket: Socket = undefined
  private isConnected: boolean = false
  

  constructor(
    private token:TokenProvider,
  ){
    token.currentToken.subscribe(token =>{
      if(token && token.usable()){
        let config = {url:this.baseUrl+token.ticket,options:{}}
        if(this.socket){
          this.socket.disconnect()          
        }
        let socket = new Socket(config)
        socket.on('message', (data,serverCallback) => {
          let message = new Message(data)
          this.onMessage(message)
          serverCallback && serverCallback()
        })
        socket.on("connect",() =>{
          console.log("socket connnected.")
          this.isConnected = true
          this.conn.next(true)
        })
        socket.on("disconnect",() =>{
          console.log("socket disconnnected.")
          this.isConnected = false
          this.conn.next(false)
        })
        socket.connect()
        this.socket = socket
      }else{
        this.socket.disconnect()
        this.socket = undefined
      }      
    })
  }

  private onMessage(message: Message) {
    this.newMessage.next(message)
  }

  send(message:Message){
    if(this.isConnected){
      this.socket.emit("message",message,(rsp: Rsp) =>{        
        if(rsp.code === 0) {
          let msg = new Message(rsp.data)
          console.log("send message return",rsp,msg)
          if(message.id){
            msg.failId = message.id
          }
          this.onMessage(msg)
        }
        else {
          message.id = new Date().getTime()
          message.failed = 1
          this.onMessage(message)
        }
      })
    }
    else {
      message.id = new Date().getTime()
      message.failed = 1
      this.onMessage(message)
    }
  }
}