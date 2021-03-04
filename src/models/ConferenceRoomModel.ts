import UserModel from './UserModel';
import BaseModel from './BaseModel';
import { uniqueId } from './../utils/StringUtil';
import ChatMessageModel from './ChatMessageModel';

export default class ConferenceRoomModel extends BaseModel {
	addMessage = (message: ChatMessageModel): ConferenceRoomModel => {
		this.chats.push(message);
		return this;
	}
	static clone(room: ConferenceRoomModel): ConferenceRoomModel {
		return Object.assign(new ConferenceRoomModel, room);
	}
	clone = (): ConferenceRoomModel => {
		return Object.assign(new ConferenceRoomModel, this);
	}
code: string = uniqueId();
active: boolean = false;
user ?: UserModel;
members: UserModel[] = [];
chats: ChatMessageModel[] = [];
addMember = (user: UserModel): ConferenceRoomModel => {
	this.members.push(user);
	return this;
}
isAdmin = (user: UserModel | undefined) => {
	if (!user) return false;
	return this.user?.id == user.id;
}
removeMember = (memberToRemove: UserModel): ConferenceRoomModel => {
	for (let i = 0; i < this.members.length; i++) {
		const member = this.members[i];
		if (memberToRemove.code == member.code) {
			this.members.splice(i, 1);
			break;
		}
	}
	return this;
}

}
