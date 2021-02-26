
import React, { Component, Fragment, RefObject } from 'react';
import './App.css';
import { withRouter } from 'react-router-dom'
import * as actions from './redux/actionCreators'
import { connect } from 'react-redux'
import SockJsClient from 'react-stomp';
import * as url from './constant/Url';
import { mapCommonUserStateToProps } from './constant/stores';
import Loader from './component/loader/Loader';
import Alert from './component/alert/Alert';
import MainLayout from './component/layout/MainLayout';
import WebResponse from './models/WebResponse';
import Spinner from './component/loader/Spinner';
import { performWebsocketConnection, setWebSocketUrl, registerWebSocketCallbacks } from './utils/websockets';
import UserService from './services/UserService';
import AnchorWithIcon from './component/navigation/AnchorWithIcon';
import { time } from 'console';
import { doItLater, updateFavicon } from './utils/EventUtil';

class IState {
  loading: boolean = false;
  loadingPercentage: number = 0;
  requestId?: string;
  mainAppUpdated: Date = new Date();
  showAlert: boolean = false;
  realtime: boolean = false;
  appIdStatus: string = "Loading App Id";
  errorAuthenticatingApp: boolean = false;
}
class App extends Component<any, IState> {
  wsConnected: boolean = false;
  loadings: number = 0;
  alertTitle: String = "Info";
  alertBody: any = null;
  alertIsYesOnly: boolean = true;
  alertIsError: boolean = false;
  alertOnYesCallback: Function = function (e) { };
  alertOnCancelCallback: Function = function (e) { };
  wsUpdateHandler: Function | undefined = undefined;
  clientRef: RefObject<SockJsClient> = React.createRef();
  userService: UserService;
  // alertRef: RefObject<Alert> = React.createRef();
  alertCallback = {
    title: "Info", message: "Info", yesOnly: false,
    onOk: () => { }, onNo: () => { }
  }

  constructor(props: any) {
    super(props);
    this.state = new IState();
    this.userService = this.props.services.userService;

    this.props.setMainApp(this);
  }
  refresh = () => { this.setState({ mainAppUpdated: new Date() }); }

  requestAppId = () => {
    this.setState({ appIdStatus: "Authenticating application", errorAuthenticatingApp: false });
    this.userService.requestApplicationId((response) => {
      this.props.setRequestId(response, this);
      this.refresh();
      this.setState({ errorAuthenticatingApp: false });
    }, this.retryRequestAppId)

  }
  retryRequestAppId = () => {
    this.setState({ appIdStatus: "Authenticating application (Retrying)", errorAuthenticatingApp: false });
    this.userService.requestApplicationIdNoAuth((response) => {
      this.props.setRequestId(response, this);
      this.setState({ errorAuthenticatingApp: false });
    },
      () =>
        this.setState({ errorAuthenticatingApp: true }))

  }
  incrementLoadings() {
    this.loadings++;
  }

  decrementLoadings() {
    this.loadings--;
    if (this.loadings < 0) {
      this.loadings = 0;
    }
  }

  startLoading(realtime: boolean = false) {
    this.incrementLoadings();
    this.setState({ loading: true, realtime: realtime });
  }

  endLoading() {
    this.decrementLoadings();
    if (this.loadings == 0) {
      if (this.state.realtime) {
        this.setState({ loadingPercentage: 100 }, this.smoothEndLoading);
      } else {
        this.setState({ loading: false, loadingPercentage: 0 });
      }
    }
  }

  smoothEndLoading = () => {
    doItLater(() => {
      this.setState({ loading: false, loadingPercentage: 0 });
    }, 100);
  }

  handleProgress = (msg: WebResponse) => {
    const percentageFloat: number = msg.percentage ?? 0;
    let percentage = Math.floor(percentageFloat);
    if (percentageFloat < 0 || percentageFloat > 100) {
      this.endLoading();
    }
    this.setState({ loadingPercentage: percentage });
  }

  showAlert(title: string, body: any, yesOnly: boolean, yesCallback: Function, noCallback?: Function) {
    this.alertTitle = title;
    this.alertBody = body;
    this.alertIsYesOnly = yesOnly;
    const app = this;
    this.alertOnYesCallback = function (e) {
      app.dismissAlert();
      yesCallback(e);
    }
    if (!yesOnly) {
      this.alertOnCancelCallback = function (e) {
        app.dismissAlert();
        if (noCallback != null) {
          noCallback(e);
        }
      };
    }
    this.setState({ showAlert: true });
  }

  dismissAlert() {
    this.alertIsError = false;
    this.setState({ showAlert: false })
  }
  showAlertError(title: string, body: any, yesOnly: boolean, yesCallback: Function, noCallback?: Function) {
    this.alertIsError = true;
    this.showAlert(title, body, yesOnly, yesCallback, noCallback)
  }

  componentDidUpdate() {
    // console.debug("APP UPDATED");
    if (this.props.applicationProfile) {
      updateFavicon(this.props.applicationProfile);
    }
    if (this.props.requestId && !this.wsConnected) {
      this.initWebsocket();
    }
  }

  componentDidMount() {
    this.requestAppId();
    this.setState({ loadingPercentage: 0 });
  }

  initWebsocket = () => {
    setWebSocketUrl(url.contextPath() + 'realtime-app');
    registerWebSocketCallbacks({
      subscribeUrl: "/wsResp/progress/" + this.props.requestId,
      callback: this.handleProgress  //must use lambda
    },
      {
        subscribeUrl: "/wsResp/" + this.props.requestId + "/update",
        callback: (response) => this.handleWsUpdate(response)
      });
    performWebsocketConnection();
    this.wsConnected = true;
  }

  private handleWsUpdate = (response: any) => {

    if (this.wsUpdateHandler) {
      this.wsUpdateHandler(response);
    }
  }

  setWsUpdateHandler = (handler: Function | undefined) => {
    this.wsUpdateHandler = handler;
  }
  resetWsUpdateHandler = () => {
    this.setWsUpdateHandler(undefined);
  }

  render() {
    if (!this.props.requestId) {
      return (
        <div className="text-center" style={{ paddingTop: '10%' }}>
          <h2>{this.state.appIdStatus}</h2>
          {this.state.errorAuthenticatingApp ?
            <AnchorWithIcon iconClassName="fas fa-redo" onClick={this.retryRequestAppId} children="Retry" /> :
            <Spinner />}
        </div>
      )
    }
    return (
      <Fragment>
        <Loading realtime={this.state.realtime} loading={this.state.loading} loadingPercentage={this.state.loadingPercentage} />
        {this.state.showAlert ?
          <Alert title={this.alertTitle}
            isError={this.alertIsError}
            onClose={(e) => this.setState({ showAlert: false })}
            yesOnly={this.alertIsYesOnly}
            onYes={this.alertOnYesCallback} onNo={this.alertOnCancelCallback}
          >{this.alertBody}</Alert> :
          null}
        <MainLayout />
        {/* <SockJsClient url={usedHost + 'realtime-app'} topics={['/wsResp/progress/' + this.props.requestId]}

          onMessage={(msg: WebResponse) => { this.handleMessage(msg) }}
          ref={this.clientRef} /> */}
      </Fragment>
    )
  }
}

function Loading(props) {
  if (props.loading == true) {
    return (
      <Loader realtime={props.realtime} progress={props.loadingPercentage} text="Please wait..." type="loading" />
    );
  }
  return null;
}


const mapDispatchToProps = (dispatch: Function) => ({
  setMainApp: (app: App) => dispatch(actions.setMainApp(app)),
  setRequestId: (response: WebResponse, app: App) => dispatch(actions.setRequestId(response, app)),
})

export default withRouter(connect(
  mapCommonUserStateToProps,
  mapDispatchToProps
)(App))
