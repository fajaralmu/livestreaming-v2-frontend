import React, { Component } from 'react'
import { doItLater } from '../../utils/EventUtil';
const initialMargin = '-200px';
const transitionDuration = '200ms';
class State {
    backColor: string = 'transparent';
    marginTop: string = initialMargin;
}
class Alert extends Component<any, State> {
    yesButtonRef;
    noButtonRef;
    state: State = new State();
    constructor(props) {
        super(props);
        this.yesButtonRef = React.createRef();
        this.noButtonRef = React.createRef();
    }
    onYes = (e) => {
        
        this.close(()=>{
            if (this.props.onYes) {
                this.props.onYes(e);
            }
        });
    }
    close = (callback:()=>any)=> {
        doItLater(()=>{
            this.setState({backColor:'transparent', marginTop: initialMargin}, ()=>{
                doItLater(callback, 100);
                
            });
        }, 100);
    }
    onNo = (e) => {
        
        this.close(()=>{
            if (this.props.onNo) {
                this.props.onNo(e);
            }
        });
    }
    onClose = (e) => {
       
        this.close(()=>{
            if (this.props.onClose) {
                this.props.onClose(e);
            }
        });
    }

    componentDidMount() {
        const isError = this.props.isError == true;
        if (!isError && this.yesButtonRef.current) {
            this.yesButtonRef.current.focus();
        } else if (isError && this.noButtonRef.current) {
            this.noButtonRef.current.focus();
        } else if (isError && this.yesButtonRef.current) {
            this.yesButtonRef.current.focus();
        }

        doItLater(()=>{
            this.setState({backColor:'rgba(100,100,100,0.7)', marginTop:'30vh'})
        }, 100);
    }

    render() {
        const title = this.props.title ? this.props.title : "Info";
        const yesOnly = this.props.yesOnly == true;
        const isError = this.props.isError == true;
        const headerClassName = isError ? 'bg-danger' : 'bg-info';
        const headerFontClassName = 'text-light';
        return (
            <>
                <Backdrop bgColor={this.state.backColor} />
                <div className="modal show" style={{ display: 'block' }}  >
                    <div className="modal-dialog -modal-dialog-centered" 
                        style={{
                            transitionDuration:  transitionDuration,
                            marginTop: this.state.marginTop
                        }}
                    >
                        <div className="modal-content" style={{marginTop:'5px',}} >
                            <Header fontClassName={headerFontClassName} className={headerClassName} title={title} onClose={this.onClose} />
                            <div className="modal-body" > {this.props.children} </div>
                            < Footer noButtonRef={this.noButtonRef} yesButtonRef={this.yesButtonRef} yesOnly={yesOnly} onYes={this.onYes} onNo={this.onNo} />
                        </div>
                    </div>
                </div>
            </>
        )
    }
}

function Backdrop(props:{bgColor:string}) {
    return (
        <div className="modal-backdrop" style={{ transitionDuration:transitionDuration, backgroundColor: props.bgColor }
        } > </div>
    );
}

function Footer(props) {
    return (
        <div className={"modal-footer " + props.className} >
            <button ref={props.yesButtonRef} type="button"
                onClick={props.onYes} className="btn btn-outline-primary" > Yes </button>
            {
                props.yesOnly ? null : <button ref={props.noButtonRef} type="button"
                    onClick={props.onNo} className="btn btn-outline-secondary" > No </button>}
        </div>
    )
}

function Header(props) {
    return (<div className={"modal-header " + props.className} >
        <h5 className={"modal-title " + props.fontClassName} id="exampleModalCenterTitle" > {props.title} </h5>
        < button onClick={props.onClose} type="button" className="close" >
            <span aria-hidden="true" className={props.fontClassName} > <i className="fas fa-times" /> </span>
        </button>
    </div>)
}

export default Alert;