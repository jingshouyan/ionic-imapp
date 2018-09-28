import { Injectable } from "@angular/core";
import { ApiProvider } from "./api.provider";
import { TokenProvider } from "./token.provider";
import { DbProvider } from "./db.provider";
import { Rsp } from "../app.model";

@Injectable()
export class RoomProvider {

    constructor(
        private api: ApiProvider,
        private token: TokenProvider,
        private db: DbProvider,
    ){

    }

    create(userIds: string[],name){
        const endpoint = "relationship/createRoom.json";
        this.api.post(endpoint,{name: name,roomUsers: userIds})
        .do(rsp => {
            if(rsp.code === Rsp.SUCCESS){
                
            }
        })
    }
}