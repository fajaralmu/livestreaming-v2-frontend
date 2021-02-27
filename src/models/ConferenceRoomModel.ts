import UserModel from './UserModel';
import BaseModel from './BaseModel';

export default class ConferenceRoomModel extends BaseModel{
	code?:string;
	active:boolean = false;
	user?:UserModel;
	members:any[] =[];
	chats?:any[];

}
