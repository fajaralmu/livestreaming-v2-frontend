import { AuthorityType } from './AuthorityType';
import BaseModel from './BaseModel';

export default class UserModel extends BaseModel{
	username?:string;
	displayName?:string;
	editPassword?:string;
	profileImage?:string;
	role :AuthorityType = AuthorityType.ROLE_USER;
	password?:string;
	mainRole?:string;
	 
	requestId?:string;

}
