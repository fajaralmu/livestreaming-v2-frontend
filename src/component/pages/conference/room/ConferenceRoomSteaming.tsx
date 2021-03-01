

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
import { removeWebsocketCallback } from '../../../../utils/websockets';
import UserModel from './../../../../models/UserModel';
import WebRtcObject from './../../../../models/WebRtcObject';
const PEER_NEW = "PEER_NEW", PEER_LEAVE = "PEER_LEAVE", ROOM_INVALIDATED = "ROOM_INVALIDATED";
class State {
    roomCode?: string;
    room?: ConferenceRoomModel;
    loading: boolean = false;
}
class ConferenceRoomSteaming extends BaseMainMenus {
    state: State = new State();
    publicConferenceService: PublicConferenceService;

    HandshakeHandler:{};
    constructor(props: any) {
        super(props, "Conference", true);
        this.publicConferenceService = this.getServices().publicConferenceService;
        this.HandshakeHandler = {
            "offer": (origin: string, data: WebRtcObject) => {
                this.handleOffer(origin, data);
            },
            "answer": (origin: string, data: WebRtcObject) => {
                this.handleAnswer(origin, data);
            },
            "candidate": (origin: string, data: WebRtcObject) => {
                this.handleCandidate(origin, data);
            },
            // "leave" :  (requestId, data) => {
            // 	handlePartnerLeave(data);
            // },
            // "dial" :  (requestId, data) =>{
            // 	handlePartnerDial(requestId);
            // }
        };
    }
    handleOffer = (origin: string, data: WebRtcObject) => {
        console.debug("HANDLE ANSWER FROM : ", origin);   
    }
    handleAnswer = (origin: string, data: WebRtcObject) => {
        console.debug("HANDLE OFFER FROM : ", origin);   
    }
    handleCandidate = (origin: string, data: WebRtcObject) => {
        console.debug("HANDLE CANDIDATE FROM : ", origin);   
    }
    componentWillUnmount() {
        this.removeWebsocketCallback('CONFERENCE_STREAMING');
    }
    recordLoaded = (response: WebResponse) => {
        this.setState({ room: Object.assign(new ConferenceRoomModel, response.conferenceRoom) }, this.initWebsocketCallback);
    }
    initWebsocketCallback = () => {
        this.addWebsocketCallback({
            id: 'CONFERENCE_STREAMING',
            subscribeUrl: '/wsResp/conference/' + this.state.roomCode,
            callback: this.wsCallback
        }, {
            id: 'PEER_HANDSHAKE',
            subscribeUrl: '/wsResp/webrtcpublicconference/' + this.state.roomCode + '/' + this.getLoggedUser()?.code,
            callback: this.webRtcHandshake
        });

    }
    webRtcHandshake = (response: WebResponse) => {
        const handshakeObject = response.realtimeHandshake;
        if (!handshakeObject) return;
        if (handshakeObject.origin == this.getLoggedUser()?.code) {
            return;
        }
        this.handleWebRtcHandshake(handshakeObject.eventId, handshakeObject.origin, handshakeObject.webRtcObject);
    }
    handleWebRtcHandshake = (event: string, origin: string, webRtcObject: WebRtcObject) => {

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
            this.publicConferenceService.enterRoom,
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
                        <RoomInfo user={user} leaveRoom={this.leaveRoom} room={this.state.room} />
                        : <SimpleWarning children="No Data" />
                }
            </div>
        )
    }
}

const RoomInfo = (props: { user: UserModel, room: ConferenceRoomModel, leaveRoom(): any }) => {
    const room: ConferenceRoomModel = Object.assign(new ConferenceRoomModel, props.room);
    return (
        <Card>
            <FormGroup label="Code">{room.code}</FormGroup>
            <FormGroup label="Created" >{room.createdDate ? new Date(room.createdDate).toLocaleString() : "-"}</FormGroup>
            <FormGroup>
                <AnchorWithIcon iconClassName="fas fa-sign-out-alt" onClick={props.leaveRoom}>
                    {props.room.isAdmin(props.user) ? "Invalidate" : "Leave"}</AnchorWithIcon>
            </FormGroup>
            <FormGroup label="Members" />
            <MemberList user={props.user} members={room.members} room={room} />
        </Card>
    )
}

const MemberList = (props: { user: UserModel, members: User[], room: ConferenceRoomModel, }) => {
    return (
        <div className="row">
            {props.members.map((member, i) => {
                return (
                    <MemberVideoStream user={props.user}
                        member={member}
                        room={props.room} key={"vid-stream-" + member.code} />
                )
            })}
        </div>
    )
}

export default withRouter(connect(
    mapCommonUserStateToProps
)(ConferenceRoomSteaming))