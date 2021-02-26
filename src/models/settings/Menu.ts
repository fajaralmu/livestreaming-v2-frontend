import BaseModel from '../BaseModel'; 
import { uniqueId } from '../../utils/StringUtil';
import { AuthorityType } from '../AuthorityType';
import User from '../UserModel';

export default class Menu extends BaseModel{
	static defaultMenuIconClassName:string = "fas fa-folder";

	code:string = uniqueId();
	name?:string;
	description?:string;
	url?:string;
	pathVariables?:string; 
	iconUrl?:string;
	color?:string;
	fontColor?:string;
	role:AuthorityType[] = [];

	//
	active?:boolean = false;
	menuClass?:string = "fas fa-folder";
	authenticated?:boolean = false;
	showSidebar?:boolean  = false;
	subMenus?:Menu[] = undefined;

	static getIconClassName = (menu:Menu) => {
		if (undefined == menu.menuClass) {
			return Menu.defaultMenuIconClassName;
		}
		return menu.menuClass;
	}

	userAuthorized? = (user?:User) : boolean => {
		
		if (this.role.length == 0) return true;
		if (!user) return false;
		for (let i = 0; i < this.role.length; i++) {
			const element = this.role[i];
			if (user.role.toString() == AuthorityType[element].toString()) {
				return true;
			}
		}
		console.debug("NOT AUTHORIZED", this.role, user.role);
		return false;
	}
}
