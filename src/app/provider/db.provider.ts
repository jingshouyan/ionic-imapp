export enum TABLES{ User, Contact, Thread,Msg }
import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular/umd';
import { TokenProvider } from './token.provider';
import { User, Thread, Contact, Msg } from '../app.model';
const win: any = window;
@Injectable()
export class DbProvider {
  private _dbPromise: Promise<any>
  private dbname: string = 'db:'
  constructor(private platform: Platform,
    tokenProvider: TokenProvider){
       
      tokenProvider.currentToken.subscribe(token =>{
        if(!token || !token.usable()) {
          return
        }
        this.dbname = 'db:'+(token&&token.userId||'')
        this._dbPromise = new Promise((resolve, reject) => {
        try {
          let _db: any;
          platform.ready().then(() => {
            if (platform.is('cordova') && win.sqlitePlugin) {
              //FOR MOBILE DEVICE
              _db = win.sqlitePlugin.openDatabase({
                name: this.dbname,
                location: 'default'
              });
            } else {
              //FOR WEBSQL
              console.warn('Storage: SQLite plugin not installed, falling back to WebSQL. Make sure to install cordova-sqlite-storage in production!');
              _db = win.openDatabase(this.dbname, '1.0', 'database', 5 * 1024 * 1024);
            }
            resolve(_db);
          })
        } catch (err) {
          reject({err: err});
        }
      })

      console.log(this.dbname);
      this._tryInit();
    })    
  }

  // Initialize the DB with our required tables
  _tryInit(drop = false) {
    if (drop) {
      this.dropTable(TABLES.User);
      this.dropTable(TABLES.Contact);
      this.dropTable(TABLES.Thread);
      this.dropTable(TABLES.Msg);
    }
    // this.createUserTable();
    this.createTable(TABLES.User,new User());
    this.createTable(TABLES.Contact,new Contact());
    this.createTable(TABLES.Thread,new Thread());
    this.createTable(TABLES.Msg,new Msg());
  }

  private dropTable(table: TABLES) {
    this.query("DROP TABLE " + TABLES[table]
    ).catch(err => {
      console.error('Storage: Unable to create initial storage User table', err.tx, err.err);
    });
  }

  private createTable(table: TABLES,obj:any){
    let sql = 'CREATE TABLE IF NOT EXISTS '+TABLES[table]+'('
    for (let f in obj) {
      if(typeof obj[f] === 'function') continue
      sql += f + ' ' + this.dbType(obj[f])
      if(f == 'id'){
        sql += ' PRIMERY KEY' 
      }
      sql += ','
    }
    sql = sql.substr(0, sql.length - 1);
    sql += ');'
    console.log(sql)

    this.query(sql).catch(err => {
      console.error('Storage: Unable to create initial storage '+TABLES[table]+' table', err.tx, err.err);
    })
  }

  private dbType(obj){
    switch(typeof obj){
      case 'string': return 'TEXT'
      case 'number': return 'NUMERIC'
      default: return 'TEXT'
    }
  }

  list(table: TABLES,condition: string = '1 = 1',params: any[] = []){
    return this.query('SELECT * FROM ' + TABLES[table] + ' WHERE '+ condition,params).then(data => {
      if (data.res.rows.length > 0) {
        console.log('Rows found.',data);
        if (this.platform.is('cordova') && win.sqlitePlugin) {
          let result = [];
          for (let i = 0; i < data.res.rows.length; i++) {
            let row = data.res.rows.item(i);
            result.push(row);
          }
          return result;
        }
        else {
          let result = [];
          for (let i = 0; i < data.res.rows.length; i++) {
            let row = data.res.rows[i];
            result.push(row);
          }
          return result;
        }
      }
      return []
    });
  }

  // list(table: TABLES): Promise<any> {
  //   return this.query('SELECT * FROM ' + TABLES[table]).then(data => {
  //     if (data.res.rows.length > 0) {
  //       console.log('Rows found.',data);
  //       if (this.platform.is('cordova') && win.sqlitePlugin) {
  //         let result = [];
  //         for (let i = 0; i < data.res.rows.length; i++) {
  //           let row = data.res.rows.item(i);
  //           result.push(row);
  //         }
  //         return result;
  //       }
  //       else {
  //         let result = [];
  //         for (let i = 0; i < data.res.rows.length; i++) {
  //           let row = data.res.rows[i];
  //           result.push(row);
  //         }
  //         return result;
  //       }
  //     }
  //     return []
  //   });
  // }

  insert(newObject, table: TABLES): Promise<any> {
    return this.query('INSERT INTO ' + TABLES[table] + ' (' + this.getFieldNamesStr(newObject)
      + ') VALUES (' + this.getQ(newObject) + ")", this.getFieldValues(newObject));
  }

  replace(newObject, table: TABLES): Promise<any> {
    this.delete(table,newObject)
    return this.insert(newObject,table)
  }

  private getFieldNamesStr(object) {
    let fields = '';
    for (let f in object) {
      let fv = object[f]
      if(typeof fv === 'function') continue
      fields += f + ',';
    }
    fields = fields.substr(0, fields.length - 1);
    return fields;
  }

  private getQ(object){
    let fields = '';
    for (let f in object) {
      let fv = object[f]
      if(typeof fv === 'function') continue
      fields += '?,';
    }
    fields = fields.substr(0, fields.length - 1);
    return fields;
  }

  private getFieldValues(object) {
    let fields = [];
    for (let f in object) {
      let fv = object[f]
      if(typeof fv === 'function') continue
      fields.push(object[f]);
    }
    return fields;
  }

  update(object, table: TABLES): Promise<any> {
    return this.query('UPDATE ' + TABLES[table] + ' SET ' + this.getFieldSetNamesStr(object) + ' WHERE id=?',
      this.getFieldValuesArray(object));
  }

  private getFieldSetNamesStr(object) {
    let fields = '';
    for (let f in object) {
      let fv = object[f]
      if(typeof fv === 'function') continue
      if (f !== "id") fields += f + "=? ,";
    }
    fields = fields.substr(0, fields.length - 1);
    return fields;
  }

  private getFieldValuesArray(object) {
    let fields = [];
    for (let f in object) {
      let fv = object[f]
      if(typeof fv === 'function') continue
      if (f !== "id") fields.push(fv);
    }
    fields.push(object.id);
    return fields;
  }

  delete(table: TABLES, object): Promise<any> {
    let query = "DELETE FROM " + TABLES[table] + " WHERE id=?";
    return this.query(query, [object.id]);
  }

  find(table: TABLES, id): Promise<any> {
    let query = "SELECT * FROM " + TABLES[table] + " WHERE id=?";
    return this.query(query, [id]).then(value =>{
      return value.res.rows[0]
    });
  }

  query(query: string, params: any[] = []): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        this._dbPromise.then(db => {
          console.log("query ...")
          db.transaction((tx: any) => {
              tx.executeSql(query, params,
                (tx: any, res: any) => resolve({tx: tx, res: res}),
                (tx: any, err: any) => reject({tx: tx, err: err}));
            },
            (err: any) => reject({err: err}));
        });
      } catch (err) {
        reject({err: err});
      }
    });
  }
}
