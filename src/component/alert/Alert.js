import React, { Component } from 'react'

class Alert extends Component {

    constructor(props) {
        super(props);
        this.yesButtonRef = React.createRef();
        this.noButtonRef = React.createRef();

        this.onYes = (e) => {
             
            if (this.props.onYes) {
                this.props.onYes(e);
            }
        }
        this.onNo = (e) => {
            
            if (this.props.onNo) {
                this.props.onNo(e);
            }
        }
        this.onClose = (e) => {
            if (this.props.onClose) {
                this.props.onClose(e);
            }
        }
    }

    componentDidMount () {
        const isError = this.props.isError == true;
        if (!isError && this.yesButtonRef.current) {
            this.yesButtonRef.current.focus();
        } else if (isError && this.noButtonRef.current) {
            this.noButtonRef.current.focus();
        } else if (isError && this.yesButtonRef.current) {
            this.yesButtonRef.current.focus();
        }
    }

    render() {
        const title = this.props.title ? this.props.title : "Info";
        const yesOnly = this.props.yesOnly == true;
        const isError = this.props.isError == true;
        const headerClassName = isError ? 'bg-danger':'bg-info';
        const headerFontClassName = 'text-light';
        return (
            <>
                <Backdrop />
                <div className="modal fade show" style={{ display: 'block' }} id="exampleModalCenter" tabIndex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle" aria-hidden="true">
                    <div className="modal-dialog modal-dialog-centered" role="document">
                        <div className="modal-content">
                            <Header fontClassName={headerFontClassName} className={headerClassName} title={title} onClose={this.onClose} />
                            <div className="modal-body"> {this.props.children}</div>
                            <Footer noButtonRef={this.noButtonRef} yesButtonRef={this.yesButtonRef} yesOnly={yesOnly} onYes={this.onYes} onNo={this.onNo} />
                        </div>
                    </div>
                </div>
            </>
        )
    }
}

function Backdrop(props) {
    return (
        <div className="modal-backdrop" style={{backgroundColor: 'rgba(100,100,100,0.7)'}} ></div>
    );
}

function Footer(props) {
    return (
        <div className={"modal-footer "+props.className}>
            <button ref={props.yesButtonRef} type="button"
                onClick={props.onYes} className="btn btn-outline-primary">Yes</button>
            {props.yesOnly ? null : <button ref={props.noButtonRef} type="button"
                onClick={props.onNo} className="btn btn-outline-secondary">No</button>}
        </div>
    )
}

function Header(props) {
    return (<div className={"modal-header "+props.className}>
        <h5 className={"modal-title "+props.fontClassName }id="exampleModalCenterTitle">{props.title}</h5>
        <button onClick={props.onClose} type="button" className="close">
            <span aria-hidden="true" className={props.fontClassName}><i className="fas fa-times"/></span>
        </button>
    </div>)
}

export default Alert;