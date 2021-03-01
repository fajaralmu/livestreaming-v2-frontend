import UserModel from './UserModel';
import BaseModel from './BaseModel';

export default class ConferenceRoomModel extends BaseModel{
    
	code?:string;
	active:boolean = false;
	user?:UserModel;
	members:any[] =[];
	chats?:any[];
	addMember = (user: UserModel) => {
        this.members.push(user);
    }
	isAdmin = (user:UserModel) => {
		return this.user?.id == user.id;
	}
	removeMember = (memberToRemove:UserModel) => {
		for (let i = 0; i < this.members.length; i++) {
			const member = this.members[i];
			if (memberToRemove.code == member.code) {
				this.members.splice(i,1);
				break;
			}
		}
	}

}
