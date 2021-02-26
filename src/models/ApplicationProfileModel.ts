import BaseModel from './BaseModel';

export default class ApplicationProfileModel extends BaseModel{
	name?:string;
	appCode?:string;
	shortDescription?:string;
	about?:string;
	welcomingMessage?:string;
	address?:string;
	contact?:string;
	website?:string;
	iconUrl?:string;
	pageIcon?:string;
	backgroundUrl?:string;
	footerIconClass?:string;
	color?:string;
	fontColor?:string;
	assetsPath?:string;
	FooterIconClassValue?:string;

}
