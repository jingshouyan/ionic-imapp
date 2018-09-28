import { Injectable } from "@angular/core";
import { TokenProvider } from "./token.provider";
import { Socket } from 'ng-socket-io';
import { Message, Rsp } from '../app.model';
import { Subject, BehaviorSubject, Observable } from 'rxjs/Rx';


@Injectable()
export class SocketProvider {

  newMessage: Subject<Message> = new Subject<Message>()
  conn: Subject<boolean> = new BehaviorSubject<boolean>(false)

  private baseUrl: string = "http://127.0.0.1:8012?ticket="
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
          message.threadId = message.tid(token.userId)
          this.onMessage(message)
          serverCallback && serverCallback()
        })
        socket.on("connect",() =>{
          console.info("socket connnected.")
          this.isConnected = true
          this.conn.next(true)
        })
        socket.on("disconnect",() =>{
          console.info("socket disconnnected.")
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

  send(message:Message): Observable<Rsp>{
    let promise = new Promise<Rsp>((resolve) => {
      try{
        if(this.isConnected){
          this.socket.emit("message",message,(r) => {
            let rsp = new Rsp(r);
            resolve(rsp);
          })
        }
        else {
          let rsp = new Rsp;
          rsp.code = 10001;
          rsp.message = 'socket disconneted!';
          resolve(rsp);
        }
      } catch(err) {
        let rsp = new Rsp;
        rsp.code = 10002;
        rsp.message = err.err;
        resolve(rsp);
      }
    });
    return Observable.fromPromise(promise);
  }
}