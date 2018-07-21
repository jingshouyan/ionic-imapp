export class BaseBean {
  createdAt: number
  updatedAt: number
  deletedAt: number
  loadedAt: number

  constructor(opt?: any){
    this.createdAt = opt && opt.createdAt || 0
    this.updatedAt = opt && opt.updatedAt || 0
    this.deletedAt = opt && opt.deletedAt || 0
    this.loadedAt = opt && opt.loadedAt || new Date().getTime()
  }

  loadTime(){
    return (new Date().getTime()) - this.loadedAt
  }
  deleted(){
    return this.deletedAt > 0
  }
}

export class Login {
  username:string
  password:string
  remember:boolean
  constructor(opt?: any){
    this.username = opt && opt.username || ''
    this.password = opt && opt.password || ''
    this.remember = opt && !!opt.remember
  }
}

export class Register {
  username: string
  password: string
  // password2: string
  nickname: string
  icon: string

  constructor(opt?: any){
    this.username = opt && opt.username || ''
    this.password = opt && opt.password || ''
    // this.password2 = opt && opt.password2 || ''
    this.nickname = opt && opt.nickname || ''
    this.icon = opt && opt.icon || ''
  }
}

export class Rsp {
  code:number
  message:string
  data:any
}

export class Token extends BaseBean {
  ticket: string
  userId: string
  userType: number
  clientType: number

  constructor(opt?: any){
    super(opt)
    this.ticket = opt && opt.ticket || ''
    this.userId = opt && opt.userId || ''
    this.userType = opt && opt.userType || 1
    this.clientType = opt && opt.clientType || 1
  }

  usable(): boolean {
    return !!this.ticket
  }

}

export class User extends BaseBean{
  id: string
  username: string
  nickname: string
  icon: string
  userType: number

  constructor(opt?: any){
    super(opt)
    this.id = opt && opt.id || ''
    this.username = opt && opt.username || ''
    this.nickname = opt && opt.nickname || ''
    this.icon = opt && opt.icon || ''
    this.userType = opt && opt.userType || 1    
  }
}

export class UserInfo {
  id: string
  username: string
  nickname: string
  icon: string
  userType: number
  remark: string
  isContact: boolean

  constructor(opt?: any){
    this.id = opt && opt.id || ''
    this.username = opt && opt.username || ''
    this.nickname = opt && opt.nickname || ''
    this.icon = opt && opt.icon || ''
    this.userType = opt && opt.userType || 1 
    this.remark = opt && opt.remark || ''
    this.isContact =  opt && !!opt.isContact
  }

}

export class Contact extends BaseBean{
  id: string
  nickname: string
  icon: string
  userType: number
  remark: string
  type: number
  revision: number

  constructor(opt?: any){
    super(opt)
    this.id = opt && opt.id || ''
    this.remark = opt && opt.remark || ''
    this.nickname = opt && opt.nickname || ''
    this.icon = opt && opt.icon || ''
    this.userType = opt && opt.userType || 1   
    this.type = opt && opt.type || 1
    this.revision = opt && opt.revision || 0
  }
}

export class Thread extends BaseBean {
  id: string
  name: string
  icon: string
  unread: number
  latestMessage: string
  latestDate: number

  constructor(opt?: any){
    super(opt)
    this.id = opt && opt.id || ''
    this.name = opt && opt.name || ''
    this.icon = opt && opt.icon || ''
    this.unread = opt && opt.unread || 0   
    this.latestMessage = opt && opt.latestMessage || ''
    this.latestDate = opt && opt.latestDate || new Date().getTime()
  }
}
export class Text {
  content:String

  constructor(opt?: any){
    this.content = opt && opt.content || ''
  }
}
export class Message {
  id: number
  senderId: string
  targetId: string
  targetType: string
  messageType: string
  text: Text
  flag: number
  relatedUsers: string[]
  sendAt: number

  constructor(opt?: any){
    this.id = opt && opt.id || 0
    this.senderId = opt && opt.senderId || ''
    this.targetId = opt && opt.targetId || ''
    this.targetType = opt && opt.targetType || ''
    this.messageType = opt && opt.messageType || ''
    this.text = opt && opt.text
    this.flag = opt && opt.flag || 0
    this.relatedUsers = opt && opt.relatedUsers || []
    this.sendAt = opt && opt.sendAt || 0
  }

  static load(opt?: any): Message{
    let message = new Message(opt)
    if(opt){
      message[opt.messageType] = JSON.parse(opt.data) || {}
      message.relatedUsers = opt.relatedUsers.split(',')
    }
    return message
  }
}

export class Msg {
  id: number
  senderId: string
  targetId: string
  targetType: string
  messageType: string
  data: string
  flag: number
  relatedUsers: string
  sendAt: number

  constructor(opt?: any){
    this.id = opt && opt.id || 0
    this.senderId = opt && opt.senderId || ''
    this.targetId = opt && opt.targetId || ''
    this.targetType = opt && opt.targetType || ''
    this.messageType = opt && opt.messageType || ''
    this.data = opt && opt.data || '{}'
    this.flag = opt && opt.flag || 0
    this.relatedUsers = opt && opt.relatedUsers || ''
    this.sendAt = opt && opt.sendAt || 0
  }

  static load(opt?: any): Msg {
    let msg = new Msg(opt)
    if(opt){
      msg.data = JSON.stringify(opt[opt.messageType])
      msg.relatedUsers = opt.relatedUsers.join(',')
    }
    console.log(msg)
    return msg
  }
}




