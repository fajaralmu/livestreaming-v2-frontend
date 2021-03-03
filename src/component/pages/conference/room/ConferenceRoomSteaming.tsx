

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
import WebRtcObject from '../../../../models/conference/WebRtcObject';
import MemberVideoStream from './MemberVideoStream';
import { doItLater } from './../../../../utils/EventUtil';
enum StreamType {
    CAMERA, SCREEN
}
const PEER_NEW = "PEER_NEW", PEER_ENTER = "PEER_ENTER", PEER_LEAVE = "PEER_LEAVE", ROOM_INVALIDATED = "ROOM_INVALIDATED";
class State {
    roomCode?: string;
    room?: ConferenceRoomModel;
    loading: boolean = false;
    streamType: StreamType = StreamType.CAMERA;
}
class ConferenceRoomSteaming extends BaseMainMenus {
    state: State = new State();
    publicConferenceService: PublicConferenceService;
    memberRefs: Map<string, React.RefObject<MemberVideoStream>> = new Map();
    videoRef: React.RefObject<HTMLVideoElement> = React.createRef();
    HandshakeHandler: {};
    videoStream?: MediaStream;
    peerToDials: string[] = new Array();
    offersToHandle: Map<string, any> = new Map();
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
            if (this.videoStream) {
                memberStream.handleOffer(origin, data.data, this.videoStream);
            } else {
                this.offersToHandle.set(origin, data.data);
            }
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
        console.debug("WILL UNMOUNT");
        this.removeWSSubscriptionCallback('CONFERENCE_STREAMING', 'PEER_HANDSHAKE');
        removeWSOnConnecCallback('USER_JOIN');
        removeWSOnConnecCallback('INIT_MEDIA_STREAM');
        this.cleanResources();
    }
    cleanResources = () => {
        if (!this.videoStream) return;
        console.debug("this.videoStream.getTracks(): ", this.videoStream.getTracks());
        for (let i = 0; i < this.videoStream.getTracks().length; i++) {
            this.videoStream.getTracks()[i].stop(); 
            console.debug("Clean track : ", this.videoStream.getTracks()[i].kind);
        }
    }
    recordLoaded = (response: WebResponse) => {
        this.setState({ room: Object.assign(new ConferenceRoomModel, response.conferenceRoom) }, this.initialize);
    }
    initialize  = () => {
        //subscription
        this.addOnWsConnectCallbacks({
            id: 'USER_JOIN',
            callback: this.notifyUserEnterRoom
        },
        {
            id: "INIT_MEDIA_STREAM", 
            callback: this.initMediaStream
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
        if (handshakeObject.origin == this.getLoggedUser()?.code) {
            return;
        }
        this.handleWebRtcHandshake(handshakeObject.eventId, handshakeObject.origin, handshakeObject.webRtcObject);
    }
    handleWebRtcHandshake = (eventId: string, origin: string, webRtcObject: WebRtcObject) => {
        console.info("webRtcHandshake: ", webRtcObject.event, " FROM ", origin);

        if (!this.HandshakeHandler[webRtcObject.event]) {
            console.warn("Handler for ", webRtcObject.event, " NOT FOUND");
            return;
        }
        this.HandshakeHandler[webRtcObject.event](origin, webRtcObject);
        if (this.videoStream) {
            console.info("handleStream ", webRtcObject.event);
            this.handleStream(this.videoStream);
        } else {
            console.info("VIDEO STREAM NOT AVAILABLE for : ", webRtcObject.event);
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
        const room = this.state.room;
        if (!room) return;

        const peer = response.user;
        if (!peer || peer.code == this.getLoggedUser()?.code) {
            console.debug("Prevent create Offer");
            return;
        }
        room.removeMember(peer);
        this.setState({ room: room }, () => {
            this.reAddMemberAndDial(peer);
        });
    }

    reAddMemberAndDial = (peer: User) => {
        const room = this.state.room;
        if (!room) return;
        // doItLater(() => {
        room.addMember(peer);
        this.setState({ room: room }, () => {
            if (!this.videoStream) {
                this.peerToDials.push(peer.code);
            } else {
                this.dialPeerByCode(peer.code);
            }
        });
        // }, 1000);
    }
    dialPeerByCode = (code: string) => {
        const ref = this.memberRefs.get(code);
        if (!ref || !ref.current || code == this.getLoggedUser()?.code) {
            console.warn("DIAL MEMBER not allowed");
            return;
        }
        if (!this.videoStream) {
            this.peerToDials.push(code);
            return;
        }
        console.debug("Will Create OFFER to: ", code);
        ref.current.createOffer(this.videoStream);
    }
    dialAllMember = () => {
        if (!this.videoStream) {
            console.warn("Cannot dial all peer, video stream is missing");
        }
        this.memberRefs.forEach((ref, code) => {
            this.dialPeerByCode(code);
        });
    }
    addNewRoomMember = (response: WebResponse) => {
        const room = this.state.room;
        if (room && response.user) {
            this.updateRoomState(room.addMember(response.user));
        }
    }
    removeRoomMember = (response: WebResponse) => {
        const room = this.state.room;
        if (room && response.user) {
            this.updateRoomState(room.removeMember(response.user));
        }
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
        let mediaStream: Promise<MediaStream>;
        // if (this.state.streamType = StreamType.CAMERA) {
        mediaStream = window.navigator.mediaDevices.getUserMedia(config)
        // } else {
        // 	// window.navigator.mediaDevices.get
        // }
        // if (mediaStream) {
        mediaStream
            .then((stream: MediaStream) => { this.handleStream(stream) })
            .catch(console.error);
        // }

    }

    handleStream = (stream: MediaStream) => {

        console.debug("START getUserMedia");
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
        this.videoStream = stream;
        this.checkDialWaiting();

        console.debug("END getUserMedia");
    }
    checkOffersWaiting = () => {
        this.offersToHandle.forEach((origin, data) => {
            this.getMemberRef(origin).then(memberStream => {
                if (this.videoStream) {
                    memberStream.handleOffer(origin, data, this.videoStream);
                }
            }).catch(console.error);

        })
        this.offersToHandle.clear();
    }
    checkDialWaiting = () => {
        if (this.peerToDials.length == 0) return;
        for (let i = 0; i < this.peerToDials.length; i++) {
            const element = this.peerToDials[i];
            this.dialPeerByCode(element);
        }
        this.peerToDials = [];
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
                            <RoomInfo redialAll={this.dialAllMember} memberRefs={this.memberRefs} user={user}
                                leaveRoom={this.leaveRoom} room={this.state.room} />

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

const RoomInfo = (props: { redialAll(): any, memberRefs: Map<string, RefObject<MemberVideoStream>>, user: UserModel, room: ConferenceRoomModel, leaveRoom(): any }) => {
    const room: ConferenceRoomModel = Object.assign(new ConferenceRoomModel, props.room);
    return (
        <Card>
            <FormGroup label="Code">{room.code}</FormGroup>
            <FormGroup label="Created" >{room.createdDate ? new Date(room.createdDate).toLocaleString() : "-"}</FormGroup>
            <FormGroup>
                <AnchorWithIcon iconClassName="fas fa-sign-out-alt" onClick={props.leaveRoom}>
                    {props.room.isAdmin(props.user) ? "Invalidate" : "Leave"}</AnchorWithIcon>
                <AnchorWithIcon iconClassName="fas fa-phone" onClick={props.redialAll}>
                    Redial</AnchorWithIcon>
            </FormGroup>
        </Card>
    )
}

export default withRouter(connect(
    mapCommonUserStateToProps
)(ConferenceRoomSteaming))