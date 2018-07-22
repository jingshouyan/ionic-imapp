import { Injectable } from "@angular/core";
import { TokenProvider } from "./token.provider";
import { Socket } from 'ng-socket-io';
import { Message } from '../app.model';
import { Subject } from 'rxjs/Rx';


@Injectable()
export class SocketProvider {

  newMessage: Subject<Message> = new Subject<Message>()

  baseUrl: string = "http://127.0.0.1:8012?ticket="
  socket: Socket = undefined


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
    this.socket.emit("message",message,rsp =>{
      console.log(rsp)
    })
  }
}