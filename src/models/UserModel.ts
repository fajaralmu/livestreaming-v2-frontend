import { AuthorityType } from './AuthorityType';
import BaseModel from './BaseModel';
import { uniqueId } from './../utils/StringUtil';

export default class UserModel extends BaseModel{
    static clone(user: UserModel): UserModel {
        return Object.assign(new UserModel, user);
    }
	username?:string;
	displayName?:string;
	editPassword?:string;
	profileImage?:string;
	role :AuthorityType = AuthorityType.ROLE_USER; 
	mainRole?:string;
	code:string = uniqueId();
	 
	requestId?:string;

	getCode = () => {
		 
		return this.code.trim();
	}
}
