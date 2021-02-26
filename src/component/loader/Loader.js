import React, { Component } from 'react'
import './Loader.css'

class Loader extends Component {
    constructor(props) {
        super(props);
        this.state = {
            timer: 130,
            intervalId: 0
        }
        this.update = () => {
            if (this.state.timer < 0) {
                clearInterval(this.state.intervalId);
            }
            console.log("tick")
            this.setState({ timer: this.state.timer - 1 })
            if (this.state.timer < 0 && this.props.endMessage) {
                this.props.endMessage();
            }
        }
    }

    componentDidMount() {
        if (this.props.withTimer == true) {
            let intervalId = setInterval(this.update, 1, null);
            this.setState({ intervalId: intervalId });
        }
    }

    render() {
        let className = "message message-" + this.props.type;

        if (this.props.realtime == true) {
            return <LoaderContent progress={this.props.progress} realtime={this.props.realtime} />
        }

        return (
            <div className={className} >
                <LoaderContent progress={this.props.progress} realtime={this.props.realtime} />
            </div>
        )
    }

}

function LoaderContent(props) {
    if (props.realtime) {
        return (
            <div className="row container-fluid bg-light" style={{margin:0, position: 'fixed', zIndex: 100 }}>
                <div className="col-1">
                <span style={{marginBottom:'3px'}} className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                </div>
                <div className="col-11 progress" style={{padding:0, marginTop: '7px', height:'10px'}}  >
                    <div className="bg-primary" style={{
                        width: props.progress + "%",
                        transitionDuration: '50ms',
                        margin: 0,
                    }}>
                    </div>
                </div>
            </div>
        );
    }
    return (
        <button className="btn btn-dark " type="button" disabled>
            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            <span className=" ">Loading...</span>
        </button>
    );
}

export default Loader;