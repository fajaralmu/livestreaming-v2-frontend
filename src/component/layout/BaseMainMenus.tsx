
import BaseComponent from './../BaseComponent';
import BasePage from './../BasePage';
export default class BaseMainMenus extends BasePage {

    title:string = "";
    constructor(props, title:string, authenticated:boolean = false) {
        super(props, title, authenticated);
    }

     

}