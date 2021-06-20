import React from 'react' 
import BaseComponent from './BaseComponent';
export default class BasePage extends BaseComponent {

    protected title:undefined|string;
    constructor(props, title :string, authentiacted:boolean = false) {
        super(props, authentiacted);
        this.title = title;
        if (this.title) {
            document.title = this.title;
        }
    }
    componentDidMount() {
        this.validateLoginStatus(()=>{
            this.scrollTop();
        });
    }
     
    titleTag(additionalText?:string) {
        return <React.Fragment>
            <h2>{this.title} {additionalText??""}</h2>
            <hr/>
        </React.Fragment>
    }
    // render () {
    //     return (
    //         <></>
    //     )
    // }
}