
import React, { Component } from 'react';
import './Spinner.css';
export default class Spinner extends Component<any, any>{
    constructor(props) {
        super(props);
    }

    render() {
        const innerDivs:JSX.Element[] = new Array<JSX.Element>();
        for (let i = 0; i <= 11; i++) {
            innerDivs.push(<div key={"spinner-item-"+i}></div>);
        }
        return (
            <div style={{width:'85px', height:'85px', display:'block'}} className="container-fluid text-center" >
                 <div style={{visibility:this.props.show == false?'hidden':'visible'}} className="lds-spinner">
                  {innerDivs}
                </div>
            </div>
        )
    }
}