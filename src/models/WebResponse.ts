import UserModel from './UserModel'; 
import ApplicationProfileModel from './ApplicationProfileModel';
import BaseModel from './BaseModel';
import Filter from './Filter';
import EntityProperty from './settings/EntityProperty';
import ConferenceRoomModel from './ConferenceRoomModel';
import WebRtcHandshake from './WebRtcHandshake';

export default class WebResponse{
	date?:Date;
	user?:UserModel;
	code?:string;
	message?:string;
	type?:string;
	entities?:any[];
	generalList?:any[];
	entity?:BaseModel;
	filter?:Filter;
	totalData?:number;
	entityProperty?:EntityProperty;
	maxValue?:number;
	quantity?:number;
	applicationProfile?:ApplicationProfileModel;
	percentage?:number;
	transactionYears?:any[];
	requestId?:string;
	token?:string;
	loggedIn?:Boolean;
	entityClass?:any;
	conferenceRoom?:ConferenceRoomModel;
	conferenceUpdate?:string;
	realtimeHandshake?:WebRtcHandshake;
	//
	rawAxiosResponse?:any;

}
