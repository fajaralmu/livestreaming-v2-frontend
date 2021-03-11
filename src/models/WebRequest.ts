import UserModel from './UserModel';
import ApplicationProfileModel from './ApplicationProfileModel';
import ChatMessageModel from './ChatMessageModel';
import Filter from './Filter';
import BaseModel from './BaseModel';
import AttachmentInfo from './AttachmentInfo';
import ConferenceRoomModel from './ConferenceRoomModel';

export default class WebRequest{
	entity?:string;
	user?:UserModel;
	profile?:ApplicationProfileModel;
	chatMessage?:ChatMessageModel;
	filter?:Filter;
	entityObject?:BaseModel;
	attachmentInfo?:AttachmentInfo;
	orderedEntities?:any[];
	regularTransaction?:boolean;
	imageData?:string;
	requestId?:string;
	token?:string;
	conferenceRoom?:ConferenceRoomModel;
}
