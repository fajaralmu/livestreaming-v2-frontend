

import React, { Component, Fragment } from 'react';
import BaseComponent from './../BaseComponent';
import { mapCommonUserStateToProps } from './../../constant/stores';
import { withRouter, Switch, Route } from 'react-router-dom';
import { connect } from 'react-redux';
import DashboardMain from '../pages/dashboard/main/DashboardMain';
import MasterDataMain from '../pages/masterdata/MasterDataMain';
import HomeMain from '../pages/home/HomeMain';
import BaseMainMenus from './BaseMainMenus';
import Menu from '../../models/settings/Menu';
import SettingsMain from '../pages/settings/SettingsMain';
import UserProfile from '../pages/settings/UserProfile';
import EditApplicationProfile from '../pages/settings/EditApplicationProfile';
import AboutUs from './../pages/home/AboutUs';
import Register from '../pages/login/Register';
import ConferenceMain from '../pages/conference/main/ConferenceMain';
import ConferenceRoom from '../pages/conference/room/ConferenceRoom';
import Login from '../pages/login/Login';
import ConferenceRoomSteaming from '../pages/conference/room/ConferenceRoomSteaming';
interface Props {
    setSidebarMenus(menus: Menu[]): any
}
class ApplicationContent extends Component<Props, any> {

    ref: React.RefObject<BaseMainMenus> = React.createRef();
    constructor(props: Props) {
        super(props);
    }
    setSidebarMenus = (menus: Menu[]) => {
        this.props.setSidebarMenus(menus);
    }
    render() {
        return (
            <Fragment>
                <LoginRoute />
                <Switch> 
                    {/* -------- home -------- */}
                    <Route exact path="/home" render={
                        (props: any) =>
                            <HomeMain />
                    } />
                    <Route exact path="/" render={
                        (props: any) =>
                            <HomeMain />
                    } />
                    <Route exact path="/about" render={
                        (props: any) =>
                            <AboutUs />
                    } />


                    {/* -------- masterdata -------- */}
                    <Route exact path="/management" render={
                        (props: any) =>
                            <MasterDataMain setSidebarMenus={this.setSidebarMenus} />
                    } />
                    <Route exact path="/management/:code" render={
                        (props: any) =>
                            <MasterDataMain setSidebarMenus={this.setSidebarMenus} />
                    } />


                    {/* ///////// PUBLIC ///////// */}

                </Switch>
                <Settings />
                <MemberQuiz /> 
                <Dashboard />
                <Conference />
            </Fragment>
        )
    }
    componentDidMount() {
        // document.title = "Login";
    }

}
const Conference = (props) => {
    return (
        <Switch>
            <Route exact path="/conference/main" render={
                (props: any) =>
                    <ConferenceMain />
            } />
            <Route exact path="/conference" render={
                (props: any) =>
                    <ConferenceMain />
            } />
            <Route exact path="/conference/room" render={
                (props: any) =>
                    <ConferenceRoom />
            } />
            <Route exact path="/conference/room/:code" render={
                (props: any) =>
                    <ConferenceRoom />
            } />
            <Route exact path="/conference/enterroom" render={
                (props: any) =>
                    <ConferenceRoomSteaming />
            } />
        </Switch>
    )
}
const LoginRoute = (props) => {

    return (
        <Switch>
            <Route exact path="/login" render={
                (props: any) =>
                    <Login />
            } />
            <Route exact path="/register" render={
                (props: any) =>
                    <Register />
            } />
        </Switch>
    )
}
const Dashboard = (props) => {
    return (
        <Switch>
            {/* -------- dashboard -------- */}
            <Route exact path="/dashboard" render={
                (props: any) =>
                    <DashboardMain />
            } />
            <Route exact path="/dashboard/quizhistory" render={
                (props: any) =>
                    <Fragment />    // <QuizHistoryPage />
            } />
        </Switch>
    )
}

const Settings = (props) => {
    return (
        <Switch>
            {/* -------- settings --------- */}
            <Route exact path="/settings" render={
                (props: any) =>
                    <SettingsMain />
            } />
            <Route exact path="/settings/user-profile" render={
                (props: any) =>
                    <UserProfile />
            } />
            <Route exact path="/settings/app-profile" render={
                (props: any) =>
                    <EditApplicationProfile />
            } />
        </Switch>
    )
}

const MemberQuiz = (props) => {
    return (
        <Switch>

        </Switch>
    )
}
 
const mapDispatchToProps = (dispatch: Function) => ({}) 

export default withRouter(connect(
    mapCommonUserStateToProps,
    mapDispatchToProps
)(ApplicationContent))