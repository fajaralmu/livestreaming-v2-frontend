import UserModel from './UserModel';
import BaseModel from './BaseModel';
import { uniqueId } from './../utils/StringUtil';

export default class ConferenceRoomModel extends BaseModel{
    static clone(room: ConferenceRoomModel) : ConferenceRoomModel{
        return Object.assign(new ConferenceRoomModel, room);
    }
    
	code:string = uniqueId();
	active:boolean = false;
	user?:UserModel;
	members:any[] =[];
	chats?:any[];
	addMember = (user: UserModel) :ConferenceRoomModel => {
		this.members.push(user);
		return this;
    }
	isAdmin = (user:UserModel|undefined) => {
		if (!user) return false;
		return this.user?.id == user.id;
	}
	removeMember = (memberToRemove:UserModel) :ConferenceRoomModel=> {
		for (let i = 0; i < this.members.length; i++) {
			const member = this.members[i];
			if (memberToRemove.code == member.code) {
				this.members.splice(i,1);
				break;
			}
		}
		return this;
	}

}
