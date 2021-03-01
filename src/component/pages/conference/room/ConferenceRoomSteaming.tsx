

import React, { FormEvent } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { mapCommonUserStateToProps } from '../../../../constant/stores';
import BaseMainMenus from '../../../layout/BaseMainMenus';
import User from '../../../../models/UserModel';
import PublicConferenceService from '../../../../services/PublicConferenceService';
import FormGroup from '../../../form/FormGroup';
import ConferenceRoomModel from '../../../../models/ConferenceRoomModel';
import WebResponse from '../../../../models/WebResponse';
import Spinner from '../../../loader/Spinner';
import SimpleWarning from '../../../alert/SimpleWarning';
import Card from '../../../container/Card';
import AnchorWithIcon from '../../../navigation/AnchorWithIcon';
import { MemberVideoStream } from './MemberVideoStream';
const PEER_NEW = "PEER_NEW", PEER_LEAVE = "PEER_LEAVE", ROOM_INVALIDATED = "ROOM_INVALIDATED";
class State {
    roomCode?: string;
    room?: ConferenceRoomModel;
    loading: boolean = false;
}
class ConferenceRoomSteaming extends BaseMainMenus {
    state: State = new State();
    publicConferenceService: PublicConferenceService;
    constructor(props: any) {
        super(props, "Conference", true);
        this.publicConferenceService = this.getServices().publicConferenceService;
    }
    recordLoaded = (response: WebResponse) => {
        this.setState({ room: Object.assign(new ConferenceRoomModel, response.conferenceRoom) }, this.initWebsocketCallback);
    }
    initWebsocketCallback = () => {
        this.addWebsocketCallback({
            id: 'CONFERENCE_STREAMING',
            subscribeUrl: '/wsResp/conference/' + this.state.roomCode,
            callback: this.wsCallback
        });

    }
    wsCallback = (response: WebResponse) => {
        console.info("response.conferenceUpdate: ", response.conferenceUpdate);
        switch (response.conferenceUpdate) {
            case PEER_NEW:
                this.addNewRoomMember(response);
                break;
            case PEER_LEAVE:
                this.removeRoomMember(response);
                break;
            case ROOM_INVALIDATED:
                this.showInfo("Room Has been invalidated");
                this.backToRoomMain();
                break;
            default:
                break;
        }
    }
    addNewRoomMember = (response: WebResponse) => {
        const room = this.state.room;
        if (!room || !response.user) return;
        room.addMember(response.user);
        this.updateRoomState(room);
    }
    removeRoomMember = (response: WebResponse) => {
        const room = this.state.room;
        if (!room || !response.user) return;
        room.removeMember(response.user);
        this.updateRoomState(room);
    }
    updateRoomState = (room: ConferenceRoomModel) => {
        this.setState({ room: Object.assign(new ConferenceRoomModel, room) });
    }
    backToRoomMain = () => {
        this.props.history.push("/conference/room");
    }
    getRoomCodeFromProps = () => {
        if (!this.props.location.state) {
            this.backToRoomMain();
            return;
        }
        console.debug("this.props.location.state: ", this.props.location.state);
        const roomCode = this.props.location.state.roomCode;
        if (roomCode) {
            document.title = "ROOM: " + roomCode;
            this.setState({ roomCode: roomCode }, this.getRoom);
        } else {
            this.backToRoomMain();
        }
    }
    startLoading = () => { this.setState({ loading: true }) }
    endLoading = () => { this.setState({ loading: false }) }
    getRoom = (e?: FormEvent) => {
        if (e) { e.preventDefault(); }
        if (!this.state.roomCode) {
            return;
        }
        this.commonAjax(
            this.publicConferenceService.getRoomByCode,
            this.recordLoaded,
            this.showCommonErrorAlert,
            this.state.roomCode
        )
    }
    componentDidMount() {
        if (!this.validateLoginStatus()) {
            this.backToLogin();
        } else {
            this.getRoomCodeFromProps();
        }
    }
    leaveRoom = () => {
        if (!this.state.roomCode) return;
        this.showConfirmationDanger("Leave Room?")
            .then(ok => {
                if (!ok) return;
                this.doLeaveRoom();
            })
    }
    doLeaveRoom = () => {
        if (!this.state.roomCode) return;
        this.commonAjax(
            this.publicConferenceService.leaveRoom,
            () => { this.props.history.push("/conference/room"); },
            this.showCommonErrorAlert,
            this.state.roomCode
        )
    }
    render() {
        const user: User | undefined = this.getLoggedUser();
        if (!user) return null;
        return (
            <div id="ConferenceRoomSteaming" className="section-body container-fluid" >
                <h2>STREAMING Room</h2>
                <div className="alert alert-info">
                    Welcome, <strong>{user.displayName}  </strong>
                </div>
                {this.state.loading ?
                    <Spinner /> :
                    this.state.room ?
                        <RoomInfo leaveRoom={this.leaveRoom} room={this.state.room} />
                        : <SimpleWarning children="No Data" />
                }
            </div>
        )
    }
}

const RoomInfo = (props: { room: ConferenceRoomModel, leaveRoom(): any }) => {
    const room: ConferenceRoomModel = Object.assign(new ConferenceRoomModel, props.room);
    return (
        <Card>
            <FormGroup label="Code">{room.code}</FormGroup>
            <FormGroup label="Created" >{room.createdDate ? new Date(room.createdDate).toLocaleString() : "-"}</FormGroup>
            <FormGroup>
                <AnchorWithIcon iconClassName="fas fa-sign-out" onClick={props.leaveRoom}>Leave</AnchorWithIcon>
            </FormGroup>
            <FormGroup label="Members" />
            <MemberList members={room.members} room={room} />
        </Card>
    )
}

const MemberList = (props: { members: User[], room: ConferenceRoomModel, }) => {
    return (
        <div className="row">
            {props.members.map((member, i) => {
                return (
                    <MemberVideoStream user={member} room={props.room} key={"vid-stream-" + member.code} />
                )
            })}
        </div>
    )
}

export default withRouter(connect(
    mapCommonUserStateToProps
)(ConferenceRoomSteaming))