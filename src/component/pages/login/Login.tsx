

import React, { RefObject, Component, FormEvent, Fragment, ChangeEvent } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import BaseComponent from './../../BaseComponent';
import { mapCommonUserStateToProps } from './../../../constant/stores';
import './Login.css';
import { performLogin } from '../../../redux/actionCreators';
import Spinner from './../../loader/Spinner';
import AnchorWithIcon from './../../navigation/AnchorWithIcon';
class IState {
    loading: boolean = false; username: string = ""; editPassword: string = "";
}
class Login extends BaseComponent {
    state: IState = new IState();
    constructor(props: any) {
        super(props, false);
    }
    startLoading = () => this.setState({ loading: true });
    endLoading = () => this.setState({ loading: false });
    login(e: FormEvent) {
        e.preventDefault();
        this.props.performLogin(this.state.username, this.state.editPassword, this);
    }
    componentDidMount() {
        document.title = "Login";
        if (this.isUserLoggedIn()) {
            this.props.history.push("/dashboard");
        }
    }
    componentDidUpdate() {

        console.debug("Login update");
        console.debug("logged in : ", this.props.loginStatus);
        console.debug("logged user : ", this.getLoggedUser());
        if (this.isUserLoggedIn()) {
            this.props.history.push("/dashboard");
        }
    }
    updateCredentialProperty = (e: ChangeEvent) => {
        const target = e.target as HTMLInputElement;
        const name: string | null = target.getAttribute("name");
        if (null == name) return;
        this.setState({ [name]: target.value });
    }
    render() {
        return (
            <div id="LoginForm" className="login-wrapper" style={{ margin: 0, padding: 0 }}>
                <div className="text-center" style={{ marginTop: '25px' }}>
                <svg viewBox="0 0 600 600" xmlns="http://www.w3.org/2000/svg" width="200" height="200"><g className="icon-svg-long" stroke="black" fill="transparent" stroke-width="2"> <path fill="none" stroke-width="6" stroke="rgb(0,176,80)" d="M 204 178 Q 332 108 422 215Q 489 313 413 414Q 336 494 228 452Q 113 387 144 258"/><path fill="none" stroke-width="6" stroke="rgb(0,176,80)" d="M 169 143 Q 315 53 440 161Q 508 229 497 342"/><path fill="none" stroke-width="6" stroke="rgb(0,176,80)" d="M 442 455 Q 329 554 195 491Q 71 413 92 268Q 107 213 135 178"/><path fill="none" stroke-width="6" stroke="rgb(0,176,80)" d="M 497 342 L 497 342 L 497 521.6000061035156 L 442 455 " /><path fill="none" stroke-width="6" stroke="rgb(0,176,80)" d="M 169 143 L 169 143 L 204 178 " /><path fill="none" stroke-width="6" stroke="rgb(0,176,80)" d="M 135 178 L 135 178 L 300 341 L 300 191.60000610351562 L 348.75 191.60000610351562 L 348.75 410.6000061035156 L 301.75 410.6000061035156 L 144 258 " /></g></svg>
                </div>
                <form name='login' onSubmit={(e) => { this.login(e) }}
                    method='POST' className="form-signin text-center">
                    <UsernameField value={this.state.username} onChange={this.updateCredentialProperty} />
                    <p />
                    <PasswordField value={this.state.editPassword} onChange={this.updateCredentialProperty} />
                    <p />
                    {this.state.loading ? <Spinner /> :
                        <Fragment>
                            <button className="btn text-light" style={{marginRight:'5px', backgroundColor: 'rgb(9,26,78)' }} type="submit">
                                Sign in
                            </button>
                            <AnchorWithIcon className="btn btn-light border border-dark " to="register" children="Register" /> 
                        </Fragment>}
                    <input name="transport_type" type="hidden" value="rest" />
                    <p />
                </form>

            </div>
        )
    }

}
const PasswordField = ({ value, onChange }) => {
    return <Fragment>
        <label className="sr-only">Password</label>
        <input style={{ borderColor: 'rgb(9,26,78)' }} name="editPassword" value={value} onChange={onChange} type="password" id="inputPassword" className="form-control"
            placeholder="Password" required />
    </Fragment>
}
const UsernameField = ({ value, onChange }) => {
    return (<Fragment>
        <label className="sr-only">Username</label>
        <input style={{ borderColor: 'rgb(9,26,78)' }} name="username" value={value} onChange={onChange} type="text" id="username" className="form-control"
            placeholder="Username" required autoFocus />
    </Fragment>)
}
const mapDispatchToProps = (dispatch: Function) => ({
    performLogin: (username: string, password: string, app: any) => dispatch(performLogin(username, password, app))
})


export default withRouter(connect(
    mapCommonUserStateToProps,
    mapDispatchToProps
)(Login))