
import React, { Component } from 'react';
interface Props {
    orientation?:string,
    show?:boolean,
    children:any,
    label?:any,
    className?:string,
}
export default class FormGroup extends Component<Props, any>
{
    constructor(props) {
        super(props);
    }
    render() {
        if (false == this.props.show) return null;
        const orientation = this.props.orientation == 'vertical' ? 'vertical' : 'horizontal';
        return (
            <div className={"form-group "+ this.props.className+ " " + (orientation == 'vertical' ? '' : 'row')}>
                <label className={(orientation == 'vertical' ? '' : 'col-sm-3')}><strong>{this.props.label ? this.props.label : null}</strong></label>
                <div className={(orientation == 'vertical' ? '' : 'col-sm-9')}>
                    {this.props.children}
                </div>
            </div>
        )
    }
}