import React, { Component } from 'react'

export default class ScrollDiv extends Component<any, any> {

    render = () => {
        return (
            <div className="div-auto-scroll">
                {this.props.children}
            </div>
        )
    }
}