
import React, { Component } from 'react';
export default class SimpleWarning extends Component<any, any>
{

    render() {
        if (this.props.show == false) return null;
        return (
            <div style={this.props.style} className={"alert alert-warning "+(this.props.className??"")}>
                {this.props.children??"Error Occured"}
            </div>
        )
    }
}