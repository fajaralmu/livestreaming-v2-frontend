

import React, { Fragment } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { mapCommonUserStateToProps } from '../../../../constant/stores';
import BaseMainMenus from '../../../layout/BaseMainMenus';
import User from '../../../../models/UserModel';
import Card from '../../../container/Card';
import PublicConferenceService from './../../../../services/PublicConferenceService';
import ConferenceRoomModel from './../../../../models/ConferenceRoomModel';
import WebResponse from './../../../../models/WebResponse';
import Spinner from '../../../loader/Spinner';
import SimpleWarning from '../../../alert/SimpleWarning';
import AnchorWithIcon from '../../../navigation/AnchorWithIcon';

class State {
    loading: boolean = false;
    room?: ConferenceRoomModel;
}
class ConferenceMain extends BaseMainMenus {
    state: State = new State();
    publicConferenceService: PublicConferenceService;
    constructor(props: any) {
        super(props, "Conference", true);
        this.publicConferenceService = this.getServices().publicConferenceService;
    }

    recordLoaded = (response: WebResponse) => {
        this.setState({ room: response.conferenceRoom });
    }
    startLoading = () => { this.setState({ loading: true }) }
    endLoading = () => { this.setState({ loading: false }) }
    getRoom = () => {
        this.commonAjax(
            this.publicConferenceService.getRoom,
            this.recordLoaded,
            this.showCommonErrorAlert
        )
    }
    createRoom = () => {
        this.commonAjax(
            this.publicConferenceService.generateRoom,
            this.recordLoaded,
            this.showCommonErrorAlert
        )
    }
    componentDidMount() {
        super.componentDidMount();
        this.getRoom();
    }

    render() {
        const user: User | undefined = this.getLoggedUser();
        if (!user) return null;
        const room = this.state.room;
        return (
            <div id="ConferenceMain" className="section-body container-fluid" >
                <h2>Conference Main</h2>
                <div className="alert alert-info">
                    Welcome, <strong>{user.displayName}  </strong>
                </div>
                <Card title="My Room">
                    {this.state.loading ?
                        <Spinner /> :
                        <Fragment>
                            {room ?
                                <RoomInfo room={room} />
                                : <SimpleWarning className="text-center">
                                    <h4>No Data</h4>
                                    <AnchorWithIcon iconClassName="fas fa-video" children="Create" onClick={this.createRoom} />
                                </SimpleWarning>}
                            <AnchorWithIcon iconClassName="fas fa-sync" children="Reload" onClick={this.getRoom} />
                        </Fragment>}
                </Card>


            </div>
        )
    }
}
const RoomInfo = (props: { room: ConferenceRoomModel }) => {

    return (
        <div></div>
    )
}
export default withRouter(connect(
    mapCommonUserStateToProps
)(ConferenceMain))