
import BaseComponent from './../BaseComponent';
import Menu from '../../models/settings/Menu';
export default class BaseMainMenus extends BaseComponent {

    title:string = "";
    constructor(props, title:string, authenticated:boolean = false) {
        super(props, authenticated);
        this.title = title;
    }

    componentDidMount(){
        if (this.authenticated) {
            this.validateLoginStatus();
        }
        document.title = this.title;
        
    }

}