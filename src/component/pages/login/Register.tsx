

import React, { RefObject, Component, FormEvent, Fragment, ChangeEvent } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import BaseComponent from '../../BaseComponent';
import { mapCommonUserStateToProps } from '../../../constant/stores';
import './Login.css';
import Spinner from '../../loader/Spinner';
import UserService from './../../../services/UserService';
import UserModel from './../../../models/UserModel';
import WebResponse from './../../../models/WebResponse'; 
import AnchorWithIcon from './../../navigation/AnchorWithIcon';
class IState {
    loading: boolean = false; displayName: string = "";
    username: string = "";
    editPassword: string = "";
    editPasswordRepeat: string = "";
    success:boolean = false;
}
class Register extends BaseComponent {
    state: IState = new IState();
    userService: UserService;
    constructor(props: any) {
        super(props, false);
        this.userService = this.getServices().userService;
    }
    startLoading = () => this.setState({ loading: true });
    endLoading = () => this.setState({ loading: false });
    register(e: FormEvent) {
        e.preventDefault();
        if (this.fieldComplete()) {
            if (this.passwordMatch() == false) {
                this.showCommonErrorAlert("Password mismatch");
                return;
            }
            this.saveUser();
        } else {
            this.showCommonErrorAlert("Field is not complete");
        }
    }
    saveUser = () => {
        const user = new UserModel();
        user.editPassword = this.state.editPassword.trim();
        user.username = this.state.username.trim();
        user.displayName = this.state.displayName.trim();
        this.commonAjax(
            this.userService.saveUser,
            this.userSaved,
            this.showCommonErrorAlert,
            user
        );
    }
    userSaved = (response: WebResponse) => {
       this.setState({success: true});
    }
    passwordMatch = () => {
        return this.state.editPassword.trim() != "" && this.state.editPassword.trim() == this.state.editPasswordRepeat.trim();
    }
    fieldComplete = () => {
        return this.state.displayName.trim() != ""
            && this.state.username.trim() != ""
            && this.state.editPassword.trim() != ""
            && this.state.editPasswordRepeat.trim() != "";
    }
    componentDidMount() {
        document.title = "Register";
        if (this.isUserLoggedIn()) {
            this.props.history.push("/dashboard");
        }
    }
    componentDidUpdate() {
        if (this.isUserLoggedIn()) {
            this.props.history.push("/dashboard");
        }
    }

    render() {

        if (this.state.success) {
            return (
                <div  className="Register-wrapper" style={{ textAlign:'center', margin: 0, paddingTop: 100 }}>
                    <h2 className="text-center text-success">
                        <i className="fas fa-check"/>
                        Register Success    
                    </h2>
                    <AnchorWithIcon to="/login" iconClassName="fas fa-sign-in-alt">Login</AnchorWithIcon>
                </div>
            )
        }

        return (
            <div  className="Register-wrapper" style={{ margin: 0, padding: 0 }}>
                <div className="text-center" style={{ marginTop: '25px' }}>
                    <h1>Register</h1>
                </div>
                <form name='Register' onSubmit={(e) => { this.register(e) }}
                    method='POST' className="form-signin text-center">
                    <CommonField name="username" value={this.state.username} onChange={this.handleInputChange} />
                    <CommonField name="displayName" value={this.state.displayName} onChange={this.handleInputChange} />

                    <PasswordField placeholder="Password" name="editPassword" value={this.state.editPassword} onChange={this.handleInputChange} />
                    <PasswordField placeholder="Repeat Password" name="editPasswordRepeat" value={this.state.editPasswordRepeat} onChange={this.handleInputChange} />

                    {this.state.loading ? <Spinner /> :
                        <button className="btn text-light" style={{ backgroundColor: 'rgb(9,26,78)' }} type="submit">
                            Register
                        </button>}
                    <p />
                </form>

            </div>
        )
    }

}
const PasswordField = ({ placeholder, name, value, onChange }) => {
    return <Fragment>
        <label className="sr-only">Password</label>
        <input style={{ borderColor: 'rgb(9,26,78)' }} name={name} value={value} onChange={onChange} type="password" id="inputPassword" className="form-control"
            placeholder={placeholder} required />
        <p />
    </Fragment>
}
const CommonField = ({ name, value, onChange }) => {
    return (<Fragment>
        <label className="sr-only">Username</label>
        <input style={{ borderColor: 'rgb(9,26,78)' }} name={name} value={value} onChange={onChange} type="text" id="username" className="form-control"
            placeholder={name} required autoFocus />
        <p />
    </Fragment>)
}
const mapDispatchToProps = (dispatch: Function) => ({
    //  performRegister: (username: string, password: string, app: any) => dispatch(performRegister(username, password, app))
})


export default withRouter(connect(
    mapCommonUserStateToProps,
    mapDispatchToProps
)(Register))