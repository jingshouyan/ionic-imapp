import { Injectable } from "@angular/core";
import { ApiProvider } from "./api.provider";
import { TokenProvider } from "./token.provider";
import { DbProvider, TABLES } from "./db.provider";
import { Rsp, Room, Conf } from "../app.model";
import { Subject, Observable } from "rxjs";
import _ from 'underscore';
import { MessageProvider } from "./message.provider";

interface IRoomOpt extends Function {
    (uMap: {[id: string]: Room}): {[id: string]: Room};
}
@Injectable()
export class RoomProvider {

    newRoom: Subject<Room> = new Subject();
    roomUpdates: Subject<IRoomOpt> = new Subject();
    roomMap: Observable<{[id: string]: Room}>;

    revision = 0;
    _map:{[id: string]: Room} = {};


    constructor(
        private api: ApiProvider,
        token: TokenProvider,
        private db: DbProvider,
        message: MessageProvider,
    ){
        this.roomMap = this.roomUpdates
        .scan((rMap: {[id: string]: Room},opt: IRoomOpt) => opt(rMap),{})
        .publishReplay(1).refCount();

        this.roomMap.subscribe(map => this._map = map);

        //从服务器获取的信息入库
        this.newRoom.filter(r => !r._db)
        .subscribe(r => this.db.replace(r,TABLES.Room).subscribe());


        this.newRoom
        .map(room => rMap => {
            const map = {};
            map[room.id] = room;
            rMap = Object.assign({},rMap,map);
            return rMap;
        })
        .subscribe(this.roomUpdates);

        //
        this.newRoom
        .map(room => room.revision)
        .filter(revision => revision > this.revision)
        .subscribe(revision => this.revision = revision);

        //当 token 变化时，加载数据库数据
        token.tokenChange
        .subscribe(() =>{
            this.revision = 0;
            this.db.list(TABLES.Room)
            .subscribe(rows =>{
                _.chain(rows).forEach(row => {
                    const room = new Room(row);
                    room._db = true;
                    this.newRoom.next(room);
                });
                this.syncData();
            });
        });

        token.tokenChange
        .map(() => () => {return {}})
        .subscribe(this.roomUpdates);

        message.newMessage
        .filter(m => m.targetType == 'room')
        .map(m => m.targetId)
        .do(id => console.log("xdfd",id))
        .distinctUntilChanged()
        .filter(id => !this._map[id])
        .subscribe(() => this.syncData());
    }

    

    create(userIds: string[],name){
        const roomUsers = _.chain(userIds).map(userId => {
            return {userId: userId};
        }).value();
        const endpoint = "relationship/createRoom.json";
        return this.api.post(endpoint,{name: name,roomUsers: roomUsers})
        .do(rsp => {
            if(rsp.code === Rsp.SUCCESS){
                this.syncData();
            }
        })
    }

    private syncData(){
        this.listRoom(this.revision)
        .filter(rsp => rsp.code === Rsp.SUCCESS && rsp.data.length > 0)
        .map(
            rsp => _.chain(rsp.data)
            .map(row => Room.fromServe(row))
            .value()
        )
        .do(rooms => rooms.forEach(room => this.newRoom.next(room)))
        .map(rooms => rooms.length)
        .filter(size => size >= Conf.BATCH_SIZE)
        .subscribe(() => this.syncData());
    }

    private listRoom(revision){
        let endpoint = "relationship/listRoom.json"
        return this.api.post(endpoint,{revision: revision,size: Conf.BATCH_SIZE})    
    }
}