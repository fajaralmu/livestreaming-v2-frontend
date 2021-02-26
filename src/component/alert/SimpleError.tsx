
import React, { Component } from 'react';
export default class SimpleError extends Component<any, any>
{

    render() {
        if (this.props.show == false) return null;
        return (
            <div style={ this.props.style} className="alert alert-danger">
                {this.props.children??"Error Occured"}
            </div>
        )
    }
}