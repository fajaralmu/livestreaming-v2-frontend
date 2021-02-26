import UserModel from './UserModel';
import BaseModel from './BaseModel';

export default class ChatMessageModel extends BaseModel{
	destinationType?:string;
	destination?:string;
	body?:string;
	date?:Date;
	user?:UserModel;

}
