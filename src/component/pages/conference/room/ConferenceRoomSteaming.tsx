

import React, { FormEvent, Fragment, RefObject } from 'react';
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
import { removeOnConnecCallback as removeWSOnConnecCallback, removeWebsocketCallback } from '../../../../utils/websockets';
import UserModel from './../../../../models/UserModel';
import WebRtcObject from './../../../../models/WebRtcObject';
import MemberVideoStream from './MemberVideoStream';
import { doItLater } from './../../../../utils/EventUtil';
const PEER_NEW = "PEER_NEW", PEER_ENTER = "PEER_ENTER", PEER_LEAVE = "PEER_LEAVE", ROOM_INVALIDATED = "ROOM_INVALIDATED";
class State {
    roomCode?: string;
    room?: ConferenceRoomModel;
    loading: boolean = false;
}
class ConferenceRoomSteaming extends BaseMainMenus {
    state: State = new State();
    publicConferenceService: PublicConferenceService;
    memberRefs: Map<string, React.RefObject<MemberVideoStream>> = new Map();
    videoRef: React.RefObject<HTMLVideoElement> = React.createRef();
    HandshakeHandler: {};
    videoStream?: MediaStream;
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
    getMemberRef = (code: string): Promise<MemberVideoStream> => {
        // console.debug("this.memberRefs: ", this.memberRefs);
        return new Promise<MemberVideoStream>((resolve, reject) => {
            if (code == this.getLoggedUser()?.code) {
                reject(new Error("Not allowed"));
            }
            const memberRef = this.memberRefs.get(code);
            console.debug("get memberRef code: ", code, " = ", memberRef);
            if (!memberRef || !memberRef.current) {
                console.debug("memberRef not exist, trying one second later");
                doItLater(() => {
                    if (!memberRef || !memberRef.current) {
                        console.debug("memberRef not exist");
                        reject(new Error("Member ref not found"));
                        return;
                    }
                    resolve(memberRef.current);
                }, 1000);
                return;
            }
            resolve(memberRef.current);
        })
    }
    handleOffer = (origin: string, data: WebRtcObject) => {
        console.debug("HANDLE OFFER FROM : ", origin);
        this.getMemberRef(origin).then(memberStream => {
            memberStream.handleOffer(origin, data.data);
        }
        ).catch(console.error);
    }
    handleAnswer = (origin: string, data: WebRtcObject) => {
        console.debug("HANDLE ANSWER FROM : ", origin);
        this.getMemberRef(origin).then(memberStream => {
            memberStream.handleAnswer(origin, data.data);
        }
        ).catch(console.error);
    }
    handleCandidate = (origin: string, data: WebRtcObject) => {
        console.debug("HANDLE CANDIDATE FROM : ", origin);
        this.getMemberRef(origin).then(memberStream => {
            memberStream.handleCandidate(origin, data.data);
        }
        ).catch(console.error);
    }
    componentWillUnmount() {
        this.removeWSSubscriptionCallback('CONFERENCE_STREAMING', 'PEER_HANDSHAKE');
        removeWSOnConnecCallback('USER_JOIN');
    }
    recordLoaded = (response: WebResponse) => {
        this.setState({ room: Object.assign(new ConferenceRoomModel, response.conferenceRoom) }, this.initialize);
    }
    initialize = () => {
        this.initWebsocketCallback();
        this.addOnWsConnectCallbacks({
            id: "INIT_MEDIA_STREAM", callback: this.initMediaStream
        });
    }
    initWebsocketCallback = () => {

        //subscription
        this.addOnWsConnectCallbacks({
            id: 'USER_JOIN',
            callback: this.notifyUserEnterRoom
        });
        //on connect
        this.addWebsocketSubscriptionCallback({
            id: 'CONFERENCE_STREAMING',
            subscribeUrl: '/wsResp/conference/' + this.state.roomCode,
            callback: this.wsSubscriptionCallback
        }, {
            id: 'PEER_HANDSHAKE',
            subscribeUrl: '/wsResp/webrtcpublicconference/' + this.state.roomCode + '/' + this.getLoggedUser()?.getCode(),
            callback: this.webRtcHandshake
        });
        this.connectWs();

    }
    notifyUserEnterRoom = () => {
        this.commonAjax(
            this.publicConferenceService.nofityUserEnter,
            (r) => { }, this.showCommonErrorAlert, this.state.roomCode);
    }

    webRtcHandshake = (response: WebResponse) => {
        const handshakeObject = response.realtimeHandshake;
        console.debug("BEGIN webRtcHandshake ");
        if (!handshakeObject) {
            console.debug("realtimeHandshake object not found");
            return;
        }
        console.debug("webRtcHandshake: ", handshakeObject.webRtcObject.event, " FROM ", handshakeObject?.origin);
        if (handshakeObject.origin == this.getLoggedUser()?.code) {
            return;
        }
        this.handleWebRtcHandshake(handshakeObject.eventId, handshakeObject.origin, handshakeObject.webRtcObject);
    }
    handleWebRtcHandshake = (eventId: string, origin: string, webRtcObject: WebRtcObject) => {
        console.debug("handleWebRtcHandshake: (", eventId, ")", webRtcObject.event);
        if (!this.HandshakeHandler[webRtcObject.event]) {
            console.warn("Handler for ", webRtcObject.event, " NOT FOUND");
            return;
        }
        this.HandshakeHandler[webRtcObject.event](origin, webRtcObject);
        if (this.videoStream) {
            this.handleStream(this.videoStream);
        }
    }
    wsSubscriptionCallback = (response: WebResponse) => {
        console.info("response.conferenceUpdate: ", response.conferenceUpdate);
        switch (response.conferenceUpdate) {
            case PEER_NEW:
                this.addNewRoomMember(response);
                break;
            case PEER_LEAVE:
                this.removeRoomMember(response);
                break;
            case PEER_ENTER:
                this.dialPeer(response);
                break;
            case ROOM_INVALIDATED:
                this.showInfo("Room Has been invalidated");
                this.backToRoomMain();
                break;
            default:
                break;
        }
    }
    dialPeer = (response: WebResponse) => {
        console.debug("DIAL PEER");
        const peer = response.user;
        if (!peer || peer.code == this.getLoggedUser()?.code) {
            console.debug("Prevent create Offer");
            return;
        }
        this.dialPeerByCode(peer.code);

    }
    dialPeerByCode = (code: string) => {
        const ref = this.memberRefs.get(code);
        if (!ref || !ref.current) {
            console.debug("MEMBER REF NOT FOUND");
            return;
        }
        console.debug("Will Create OFFER to: ", code);
        ref.current.createOffer(code);
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

    initMediaStream = () => {
        const config = { video: true, audio: true };

        // if (streamType == "camera") {
        const mediaStream: Promise<MediaStream> = window.navigator.mediaDevices.getUserMedia(config)
        // } else {
        // 	mediaStream = window.navigator.mediaDevices.getDisplayMedia(config)
        // }
        mediaStream
            .then((stream: MediaStream) => { this.handleStream(stream) })
            .catch(console.error);
    }

    handleStream = (stream: MediaStream) => {
        this.videoStream = stream;
        console.debug("START getUserMedia");
        // log("Start handle user media");
        if (this.videoRef.current) {
            this.videoRef.current.srcObject = stream;
        } else {
            doItLater(() => {
                if (this.videoRef.current) {
                    this.videoRef.current.srcObject = stream;
                } else {
                    console.debug("this.videoRef.current not found");
                }
            }, 1000);
            console.debug("this.videoRef.current not found, retrying in 1 sec");
        }
        // var peerCount = 0;
        // for (var key in peerConnections) {
        this.memberRefs.forEach((ref, key) => {
            if (key != this.getLoggedUser()?.getCode()) {
                if (ref.current) {
                    ref.current.addStream(stream);
                }
            }

        })
        //     const entry = peerConnections[key];
        //     if (null == entry) continue;
        //     if (isUserRequestId(key)) {

        //     } else {

        //         const peerConnection = entry['connection'];
        //         if (!peerConnection.getLocalStreams() || peerConnection.getLocalStreams().length == 0) {
        //             peerConnections[key]['connection'].addStream(stream);
        //         }
        //         //updatePeerConnection(key, peerConnection);
        //         peerCount++;
        //     }

        // }
        console.debug("END getUserMedia");
        // log("End HandleMedia peerCount: " + peerCount);
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
                        <Fragment>
                            <video muted ref={this.videoRef} height="200" width={200} controls />
                            <RoomInfo memberRefs={this.memberRefs} user={user} leaveRoom={this.leaveRoom} room={this.state.room} />

                            {/* <MemberList memberRefs={this.memberRefs} user={user} members={this.state.room.members} room={this.state.room} /> */}
                            <Card>
                                <div className="row">
                                    {this.state.room.members.map((member: User, i) => {
                                        member = Object.assign(new UserModel, member);
                                        if (!this.memberRefs.get(member.getCode())) {
                                            this.memberRefs.set(member.getCode(), React.createRef());
                                        }
                                        return (
                                            <MemberVideoStream redial={this.dialPeerByCode} ref={this.memberRefs.get(member.getCode())} user={user} member={member}
                                                room={this.state.room ?? new ConferenceRoomModel()} key={"vid-stream-" + member.code} />
                                        )
                                    })}
                                </div>
                            </Card>
                        </Fragment>
                        : <SimpleWarning children="No Data" />
                }
            </div>
        )
    }
}

const RoomInfo = (props: { memberRefs: Map<string, RefObject<MemberVideoStream>>, user: UserModel, room: ConferenceRoomModel, leaveRoom(): any }) => {
    const room: ConferenceRoomModel = Object.assign(new ConferenceRoomModel, props.room);
    return (
        <Card>
            <FormGroup label="Code">{room.code}</FormGroup>
            <FormGroup label="Created" >{room.createdDate ? new Date(room.createdDate).toLocaleString() : "-"}</FormGroup>
            <FormGroup>
                <AnchorWithIcon iconClassName="fas fa-sign-out-alt" onClick={props.leaveRoom}>
                    {props.room.isAdmin(props.user) ? "Invalidate" : "Leave"}</AnchorWithIcon>
            </FormGroup>
        </Card>
    )
}

// const MemberList = (props: {  memberRefs: Map<string, RefObject<MemberVideoStream>>, user: UserModel, members: User[], room: ConferenceRoomModel, }) => {
//     const memberRefs = props.memberRefs;
//     return (
//         <Card>
//             <div className="row">
//                 {props.members.map((member, i) => {
//                     if (!memberRefs.get(member.code)) {
//                         memberRefs.set(member.code, React.createRef());
//                     }
//                     return (
//                         <MemberVideoStream redial={props.dialPeer} ref={memberRefs.get(member.code)} user={props.user}
//                             member={member}
//                             room={props.room} key={"vid-stream-" + member.code} />
//                     )
//                 })}
//             </div>
//         </Card>
//     )
// }

export default withRouter(connect(
    mapCommonUserStateToProps
)(ConferenceRoomSteaming))