export class BaseBean {
  createdAt: number;
  updatedAt: number;
  deletedAt: number;
  loadedAt: number;

  constructor(opt?: any){
    this.createdAt = opt && opt.createdAt || 0;
    this.updatedAt = opt && opt.updatedAt || 0;
    this.deletedAt = opt && opt.deletedAt || 0;
    this.loadedAt = opt && opt.loadedAt || new Date().getTime();
  }

  loadTime(){
    return (new Date().getTime()) - this.loadedAt;
  }
  deleted(){
    return this.deletedAt > 0;
  }
}

export class Login {
  username:string;
  password:string;
  remember:boolean
  constructor(opt?: any){
    this.username = opt && opt.username || '';
    this.password = opt && opt.password || '';
    this.remember = opt && !!opt.remember
  }
}

export class Register {
  username: string;
  password: string;
  // password2: string;
  nickname: string;
  icon: string;

  constructor(opt?: any){
    this.username = opt && opt.username || '';
    this.password = opt && opt.password || '';
    // this.password2 = opt && opt.password2 || '';
    this.nickname = opt && opt.nickname || '';
    this.icon = opt && opt.icon || '';
  }
}

export class Rsp {
  static SUCCESS = 1;
  code:number;
  message:string;
  data:any

  constructor(opt?: any){
    this.code = opt && opt.code || 0;
    this.message = opt && opt.message || '';
    this.data = opt && opt.data || {}
  }
}

export class Token extends BaseBean {
  ticket: string;
  userId: string;
  userType: number;
  clientType: number;

  constructor(opt?: any){
    super(opt)
    this.ticket = opt && opt.ticket || '';
    this.userId = opt && opt.userId || '';
    this.userType = opt && opt.userType || 1;
    this.clientType = opt && opt.clientType || 1;
  }

  usable(): boolean {
    return !!this.ticket;
  }

}

export class User extends BaseBean{
  id: string;
  username: string;
  nickname: string;
  icon: string;
  userType: number;
  _db: boolean;

  avatar(){
    return this.icon || "assets/imgs/avatar.jpg"
  }

  constructor(opt?: any){
    super(opt)
    this.id = opt && opt.id || '';
    this.username = opt && opt.username || '';
    this.nickname = opt && opt.nickname || '';
    this.icon = opt && opt.icon || '';
    this.userType = opt && opt.userType || 1;
    this._db = opt && !!opt._db;
  }
}

export class UserInfo {
  id: string;
  username: string;
  nickname: string;
  icon: string;
  userType: number;
  remark: string;
  isContact: boolean

  avatar(){
    return this.icon || "assets/imgs/avatar.jpg";
  }

  name() {
    return this.remark || this.nickname || '';
  }

  constructor(opt?: any){
    this.id = opt && opt.id || '';
    this.username = opt && opt.username || '';
    this.nickname = opt && opt.nickname || '';
    this.icon = opt && opt.icon || '';
    this.userType = opt && opt.userType || 1;
    this.remark = opt && opt.remark || '';
    this.isContact =  opt && !!opt.isContact;
  }

}

export class Contact extends BaseBean{
  id: string;
  nickname: string;
  icon: string;
  userType: number;
  remark: string;
  type: number;
  revision: number;
  _db: boolean

  avatar(){
    return this.icon || "assets/imgs/avatar.jpg";
  }

  constructor(opt?: any){
    super(opt)
    this.id = opt && opt.id || '';
    this.remark = opt && opt.remark || '';
    this.nickname = opt && opt.nickname || '';
    this.icon = opt && opt.icon || '';
    this.userType = opt && opt.userType || 1;
    this.type = opt && opt.type || 1;
    this.revision = opt && opt.revision || 0;
    this._db = opt && !!opt._db;
  }
}

export class Thread extends BaseBean {
  id: string;
  name: string;
  remark: string;
  icon: string;
  unread: number;
  latestMessage: string;
  latestTime: number;
  targetId: string;
  targetType: string;
  draft: string;
  _db: boolean

  avatar(){
    return this.icon || "assets/imgs/avatar.jpg";
  }


  constructor(opt?: any){
    super(opt)
    this.id = opt && opt.id || '';
    this.name = opt && opt.name || '';
    this.remark = opt && opt.remark || '';
    this.icon = opt && opt.icon || '';
    this.unread = opt && opt.unread || 0;   
    this.latestMessage = opt && opt.latestMessage || '';
    this.latestTime = opt && opt.latestTime || new Date().getTime();
    this.targetId = opt && opt.targetId || '';
    this.targetType = opt && opt.targetType || '';
    this.draft = opt && opt.draft || '';
    this._db = opt && !!opt._db;
    if(this.targetId && this.targetType){
      this.id = Thread.tid(this.targetId,this.targetType);
    }
  }

  static tid(id:string,type:string): string{
    return id+"#"+type;
  }

}
export class Text {
  content: string;

  constructor(opt?: any){
    this.content = opt && opt.content || '';
  }
}
export class Message extends BaseBean {
  id: number;
  senderId: string;
  targetId: string;
  targetType: string;
  messageType: string;
  text: Text;
  flag: number;
  relatedUsers: string[];
  sentAt: number;
  localId: number;
  localTime: number;
  state:  number;// 消息状态，0 完成，1 发送中，2 失败
  threadId: string;

  tid(myId:String): string{
    if(this.targetId === myId){
      return `${this.senderId}#${this.targetType}`;
    }
    return `${this.targetId}#${this.targetType}`;
  }

  constructor(opt?: any){
    super(opt);
    this.id = opt && opt.id || 0;
    this.senderId = opt && opt.senderId || '';
    this.targetId = opt && opt.targetId || '';
    this.targetType = opt && opt.targetType || '';
    this.messageType = opt && opt.messageType || '';
    this.text = opt && opt.text;
    this.flag = opt && opt.flag || 0;
    this.relatedUsers = opt && opt.relatedUsers || [];
    this.sentAt = opt && opt.sentAt || 0;
    this.localId = opt && opt.localId || 0; - new Date().getTime();
    this.localTime = opt && opt.localTime || new Date().getTime();
    this.state = opt && opt.state || 0;
    this.threadId = opt && opt.threadId || '';
  }

  static load(opt?: any): Message{
    let message = new Message(opt);
    if(opt){
      message[opt.messageType] = JSON.parse(opt.data) || {};
      message.relatedUsers = opt.relatedUsers.split(',');
    }
    return message;
  }
}

export class Msg {
  id: number;
  senderId: string;
  targetId: string;
  targetType: string;
  messageType: string;
  data: string;
  flag: number;
  relatedUsers: string;
  sentAt: number;
  threadId: string;
  localId: number;
  localTime: number;
  state: number;

  constructor(opt?: any){
    this.id = opt && opt.id || 0;
    this.senderId = opt && opt.senderId || '';
    this.targetId = opt && opt.targetId || '';
    this.targetType = opt && opt.targetType || '';
    this.messageType = opt && opt.messageType || '';
    this.data = opt && opt.data || '{}'
    this.flag = opt && opt.flag || 0;
    this.relatedUsers = opt && opt.relatedUsers || '';
    this.sentAt = opt && opt.sentAt || 0;
    this.threadId = opt && opt.threadId || '';
    this.localId = opt && opt.localId || new Date().getTime();
    this.localTime = opt && opt.localTime || new Date().getTime();
    this.state = opt && opt.state || 0;
  }

  static load(opt?: any): Msg {
    let msg = new Msg(opt);
    if(opt){
      msg.data = JSON.stringify(opt[opt.messageType]);
      msg.relatedUsers = opt.relatedUsers.join(',');
    }
    return msg;
  }
}

export class Room extends BaseBean {
  id: number;
  name: string;
  icon: string;
  userCount: number;
  revision: number;

  constructor(opt?: any){
    super(opt);
    this.id = opt && opt.id || 0;
    this.name = opt && opt.name || '';
    this.icon = opt && opt.icon || '';
    this.userCount = opt && opt.userCount || 0;
    this.revision = opt && opt.revision || 0;
  }

}




