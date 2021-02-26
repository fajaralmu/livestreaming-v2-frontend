import React, { Component } from 'react'
import AnchorButton from './AnchorButton';
interface Props {
    onClick(val:boolean):void,
    active:boolean,
    yesLabel?:string,
    noLabel?:string
}
export default class ToggleButton extends Component<Props, any>{
    
    render() {
        const props = this.props;
        const active = this.props.active;
        return (
            <div className="btn-group">
                <AnchorButton className={"btn  btn-sm " + (active ? "btn-dark" : "btn-outline-dark")} onClick={(e) => this.props.onClick(true)} >
                    {props.yesLabel??"Yes"}</AnchorButton>
                <AnchorButton className={"btn  btn-sm " + (active == false ? "btn-dark" : "btn-outline-dark")} onClick={(e) => this.props.onClick(false)}  >
                    {props.noLabel??"No"}</AnchorButton>
                
            </div>
        )
    }
}