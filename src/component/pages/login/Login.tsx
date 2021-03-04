

import React, { RefObject, Component, FormEvent, Fragment, ChangeEvent } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import BaseComponent from './../../BaseComponent';
import { mapCommonUserStateToProps } from './../../../constant/stores';
import './Login.css';
import { performLogin } from '../../../redux/actionCreators';
import Spinner from './../../loader/Spinner';
import AnchorWithIcon from './../../navigation/AnchorWithIcon';
import AppIcon from './AppIcon';
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
                <AppIcon />
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