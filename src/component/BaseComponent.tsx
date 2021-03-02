import { Component } from 'react';
import { byId } from '../utils/ComponentUtil';
import WebResponse from './../models/WebResponse';
import ApplicationProfileModel from './../models/ApplicationProfileModel';
import User from '../models/UserModel';
import Services from './../services/Services';
import { AuthorityType } from '../models/AuthorityType';
import WebRequest from './../models/WebRequest';
import { addOnWsConnectCallbacks, performWebsocketConnection, registerWebSocketCallbacks, removeWebsocketCallback, sendToWebsocket } from './../utils/websockets';

export default class BaseComponent extends Component<any, any> {
    parentApp: any;
    authenticated: boolean = true;
    state: any = { updated: new Date() };
    constructor(props: any, authenticated = false) {
        super(props);

        this.authenticated = authenticated
        this.state = {
            ...this.state
        }
        this.parentApp = this.props.mainApp;
    }

    validateLoginStatus = () :boolean => {
        if (this.authenticated == false) return true;
        if (this.isLoggedUserNull()) {
            this.backToLogin();
            return false;
        }
        return true;
    }

    protected sendWebSocket = (url: string, payload: WebRequest) => {
        sendToWebsocket(url, payload);
    }

    protected setWsUpdateHandler = (handler: Function | undefined) => {
        if (this.parentApp) {
            this.parentApp.setWsUpdateHandler(handler);
        }
    }
    //:{id:string, subscribeUrl:string, callback(response:WebResponse):any}
    protected addWebsocketSubscriptionCallback = (...callbacks:any[]) => {
        registerWebSocketCallbacks(...callbacks);
        
    }

    protected connectWs = () =>{
        performWebsocketConnection();
    }
    
   protected addOnWsConnectCallbacks = (...onWsConnectCallbacks) => {
        addOnWsConnectCallbacks(...onWsConnectCallbacks);
    }
    protected removeWSSubscriptionCallback = (...id) => {
        for (let i = 0; i < id.length; i++) {
            removeWebsocketCallback(id[i]);
        }
       
        performWebsocketConnection();
    }
    protected resetWsUpdateHandler = () => {
        if (this.parentApp) {
            this.parentApp.resetWsUpdateHandler();
        }
    }

    getApplicationProfile(): ApplicationProfileModel {
        return this.props.applicationProfile == null ? new ApplicationProfileModel() : this.props.applicationProfile;
    }

    handleInputChange = (event: any) => {
        const target = event.target;
        const value = target.type == 'checkbox' ? target.checked : target.value;
        this.setState({ [target.name]: value });
        console.debug("input changed: ", target.name, value);
    }

    focusToActiveField() {
        if (this.state.activeId != null && byId(this.state.activeId) != null) {
            const element = byId(this.state.activeId);
            if (element != null) {
                element.focus();
            }
        }
    }
    /**
     * 
     * @param {boolean} withProgress 
     */
    startLoading(withProgress: boolean) {
        this.parentApp.startLoading(withProgress);
    }

    endLoading() {
        this.parentApp.endLoading();
    }
    /**
     * api response must be instance of WebResponse
     * @param method 
     * @param withProgress 
     * @param successCallback 
     * @param errorCallback 
     * @param params 
     */
    doAjax(method: Function, withProgress: boolean, successCallback: Function, errorCallback?: Function, ...params: any) {
        this.startLoading(withProgress);

        method(...params).then(function (response: WebResponse) {
            if (successCallback) {
                successCallback(response);
            }
        }).catch(function (e) {
            if (errorCallback) {
                errorCallback(e);
            } else {
                if (typeof (e) == 'string') {
                    alert("Operation Failed: " + e);
                }
                alert("resource not found");
            }
        }).finally(() => {
            this.endLoading();
        })
    }

    commonAjax(method: Function, successCallback: Function, errorCallback: Function, ...params: any) {
        this.doAjax(method, false, successCallback, errorCallback, ...params);
    }
    commonAjaxWithProgress(method: Function, successCallback: Function, errorCallback: Function, ...params: any) {
        this.doAjax(method, true, successCallback, errorCallback, ...params);
    }
    getLoggedUser(): User | undefined {
        const user: User | undefined = this.props.loggedUser;
        if (!user) return undefined;
        user.editPassword = "^_^";
        return Object.assign(new User(), user);
    }
    isAdmin = (): boolean => {
        const user = this.getLoggedUser();
        if (!user) return false;
        return user.role == AuthorityType.ROLE_ADMIN;
    }
    isLoggedUserNull(): boolean {
        return false == this.props.loginStatus || null == this.props.loggedUser;
    }
    isUserLoggedIn(): boolean {
        return true == this.props.loginStatus && null != this.props.loggedUser;
    }
    showConfirmation = (body: any): Promise<boolean> => {
        const app = this;
        return new Promise((resolve, reject) => {
            const onYes = (e) => {
                resolve(true);
            }
            const onNo = (e) => {
                resolve(false);
            }
            app.parentApp.showAlert("Confirmation", body, false, onYes, onNo);
        });

    }
    showConfirmationDanger = (body: any): Promise<any> => {
        const app = this;
        return new Promise(function (resolve, reject) {
            const onYes = function (e) {
                resolve(true);
            }
            const onNo = function (e) {
                resolve(false);
            }
            app.parentApp.showAlertError("Confirmation", body, false, onYes, onNo);
        });

    }
    showInfo = (body: any) => {
        this.parentApp.showAlert("Info", body, true, function () { });
    }
    showError = (body: any) => {
        this.parentApp.showAlertError("Error", body, true, function () { });
    }

    backToLogin() {
        if (this.props.history != null) {
            this.props.history.push("/login");
        }
    }
    refresh() {
        this.setState({ updated: new Date() });
    }

    showCommonErrorAlert = (e: any) => {
        console.error(e);

        let message;
        if (e.response && e.response.data) {
            message = e.response.data.message;
        } else {
            message = e;
        }
        this.showError("Operation Failed: " + message);
    }
    componentDidMount() {
        this.validateLoginStatus();
    }
    componentDidUpdate() {
        if (this.authenticated == true && this.isLoggedUserNull()) {
            console.debug(typeof this, "BACK TO LOGIN");
            this.validateLoginStatus();
        }
    }

    getServices = (): Services => {
        return this.props.services;
    }
}