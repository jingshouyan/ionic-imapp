import { Injectable } from "@angular/core";
import { ApiProvider } from "./api.provider";
import { TokenProvider } from "./token.provider";
import { DbProvider, TABLES } from "./db.provider";
import { Rsp, Room, Conf } from "../app.model";
import { Subject, Observable } from "rxjs";
import _ from 'underscore';

interface IRoomOpt extends Function {
    (uMap: {[id: string]: Room}): {[id: string]: Room};
}
const initMap = {};
@Injectable()
export class RoomProvider {

    newRoom: Subject<Room> = new Subject();
    roomUpdates: Subject<IRoomOpt> = new Subject();
    roomMap: Observable<{[id: string]: Room}>;

    revision = 0;


    constructor(
        private api: ApiProvider,
        private token: TokenProvider,
        private db: DbProvider,
    ){
        this.roomMap = this.roomUpdates
        .scan((rMap: {[id: string]: Room},opt: IRoomOpt) => opt(rMap),initMap)
        .publishReplay(1).refCount();

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
        .map(() => () => initMap)
        .subscribe(this.roomUpdates);

    }

    

    create(userIds: string[],name){
        const endpoint = "relationship/createRoom.json";
        this.api.post(endpoint,{name: name,roomUsers: userIds})
        .do(rsp => {
            if(rsp.code === Rsp.SUCCESS){
                this.syncData();
            }
        })
    }

    private syncData(){
        this.listRoom(this.revision)
        .filter(rsp => rsp.code === Rsp.SUCCESS && rsp.data.length > 0)

    }

    private listRoom(revision){
        let endpoint = "relationship/listContact.json"
        return this.api.post(endpoint,{revision: revision,size: Conf.BATCH_SIZE})    
    }
}