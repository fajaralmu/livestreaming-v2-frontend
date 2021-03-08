import UserModel from './UserModel';
import BaseModel from './BaseModel';
import { uniqueId } from './../utils/StringUtil';
import ChatMessageModel from './ChatMessageModel';
import AppliactionConfiguration from './ApplicationConfiguration';

export default class ConferenceRoomModel extends BaseModel {
	getMediaStreamConfig = (): MediaStreamConstraints => {
		const videoConstraint: MediaTrackConstraints = {
			width: { ideal: this.config.videoWidth }, height: { ideal: this.config.videoHeight }
		}
		const mediaStreamConfig: MediaStreamConstraints = { video: videoConstraint, audio: true };
		return mediaStreamConfig;
	}

	code: string = uniqueId();
	active: boolean = false;
	user?: UserModel;
	members: UserModel[] = [];
	chats: ChatMessageModel[] = [];
	config: AppliactionConfiguration = new AppliactionConfiguration();
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
}
