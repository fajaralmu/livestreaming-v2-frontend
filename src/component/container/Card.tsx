
import React, { Component } from 'react';
export default class Card extends Component<any, any> {
    constructor(props: any) {
        super(props)
    }

    render() {

        return (
            <div {...this.props.attributes} className={"card " + this.props.className}>
                {this.props.title ? <div className="card-header">
                    {this.props.title}
                </div> : null}
                <div className="card-body">
                    {this.props.children}
                </div>
                {this.props.footerContent != undefined ?
                    <div className="card-footer">
                        {this.props.footerContent}
                    </div>
                    : null}
            </div>
        )
    }

}