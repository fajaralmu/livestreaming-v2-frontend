

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
import { removeOnConnecCallbacks } from '../../../../utils/websockets';
import UserModel from './../../../../models/UserModel';
import WebRtcObject from '../../../../models/conference/WebRtcObject';
import MemberVideoStream from './MemberVideoStream';
import { doItLater } from './../../../../utils/EventUtil';
import SimpleError from '../../../alert/SimpleError';
import ChatMessageModel from './../../../../models/ChatMessageModel';
import ChatMessagePanel from './ChatMessagePanel';
import ToggleButton from '../../../navigation/ToggleButton';
enum StreamType {
    CAMERA, SCREEN
}
const PEER_NEW = "PEER_NEW", CHAT_MESSAGE = "CHAT_MESSAGE", PEER_ENTER = "PEER_ENTER", PEER_LEAVE = "PEER_LEAVE", ROOM_INVALIDATED = "ROOM_INVALIDATED";
class State {
    roomCode?: string;
    room?: ConferenceRoomModel;
    loading: boolean = false;
    streamType: StreamType = StreamType.CAMERA;
    errorMessage?: string;
    logEnabled: boolean = false;
}
const videoConstraint: MediaTrackConstraints = {
    width: { ideal: 30 }, height: { ideal: 30 }
}
class ConferenceRoomSteaming extends BaseMainMenus {
    state: State = new State();
    publicConferenceService: PublicConferenceService;
    memberRefs: Map<string, React.RefObject<MemberVideoStream>> = new Map();
    videoRef: React.RefObject<HTMLVideoElement> = React.createRef();
    handshakeHandler: Record<string, (origin: string, data: WebRtcObject) => void>;
    videoStream?: MediaStream;
    videoStreamError: boolean = false;
    peerToDials: string[] = new Array();
    offersToHandle: Map<string, WebRtcObject> = new Map();


    constructor(props: any) {
        super(props, "Conference", true);
        this.publicConferenceService = this.getServices().publicConferenceService;
        this.handshakeHandler = {
            "offer": (origin: string, data: WebRtcObject) => {
                this.handleOffer(origin, data);
            },
            "answer": (origin: string, data: WebRtcObject) => {
                this.handleAnswer(origin, data);
            },
            "candidate": (origin: string, data: WebRtcObject) => {
                this.handleCandidate(origin, data);
            },
            "dial": (origin: string, data: WebRtcObject) => {
                this.handleDial(origin, data);
            },
        };
    }
    setLogEnabled = (val: boolean) => {
        this.setState({ logEnabled: val },
            () =>
                this.memberRefs.forEach(ref => {
                    if (ref.current) {
                        ref.current.setLogEnabled(val);
                    }
                }));
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
    handleDial = (origin: string, data: WebRtcObject) => {
        console.debug("HANDLE ", data.event, " FROM : ", origin);
        this.getMemberRef(origin).then(ref => {
            if (this.videoStream) {
                ref.createOffer(this.videoStream);
            } else {
                this.offersToHandle.set(origin, data.data);
            }

        });
    }
    handleOffer = (origin: string, data: WebRtcObject) => {
        console.debug("HANDLE ", data.event, " FROM : ", origin);
        this.getMemberRef(origin).then(ref => {
            ref.handleOffer(origin, data.data, this.videoStream);
            if (!this.videoStream) {
                this.offersToHandle.set(origin, data.data);
            }
        }).catch(console.error);
    }
    handleAnswer = (origin: string, data: WebRtcObject) => {
        console.debug("HANDLE ", data.event, " FROM : ", origin);
        this.getMemberRef(origin).then(ref => {
            ref.handleAnswer(origin, data.data);
        }).catch(console.error);
    }
    handleCandidate = (origin: string, data: WebRtcObject) => {
        console.debug("HANDLE ", data.event, " FROM : ", origin);
        this.getMemberRef(origin).then(ref => {
            ref.handleCandidate(origin, data.data);
        }).catch(console.error);
    }
    componentWillUnmount() {
        console.debug("WILL UNMOUNT");
        this.removeWSSubscriptionCallback('CONFERENCE_STREAMING', 'PEER_HANDSHAKE');
        removeOnConnecCallbacks('USER_JOIN', 'INIT_MEDIA_STREAM');
        this.cleanResources();
    }
    cleanResources = () => {
        if (!this.videoStream) return;
        console.debug("this.videoStream.getTracks(): ", this.videoStream.getTracks());
        this.videoStream.getTracks().forEach(stream => {
            stream.stop();
            console.debug("Clean track : ", stream.kind);
        })
    }
    recordLoaded = (response: WebResponse) => {
        if (response.conferenceRoom) {
            this.setState({ room: ConferenceRoomModel.clone(response.conferenceRoom) }, this.initialize);
        } else { console.error("ROOM NOT FOUND") }
    }
    initialize = () => {
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

        if (!this.handshakeHandler[webRtcObject.event]) {
            console.warn("Handler for ", webRtcObject.event, " NOT FOUND");
            return;
        }
        this.handshakeHandler[webRtcObject.event](origin, webRtcObject);
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
            case CHAT_MESSAGE:
                if (response.entity)
                    this.addChatMessage(response.entity);
                break;
            default:
                break;
        }
    }
    addChatMessage = (message: ChatMessageModel) => {
        const room = this.state.room;
        if (!room) return;
        this.setState({ room: room.addMessage(message) });
    }
    dialPeer = (response: WebResponse) => {
        const room = this.state.room;
        if (!room) return;

        const peer = response.user;
        if (!peer || peer.code == this.getLoggedUser()?.code) {
            console.info("Prevent Dial MEMBER: ", peer?.code);
            return;
        }
        console.info("DIAL MEMBER: ", peer.code);
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
            if (!this.videoStream && this.videoStreamError == false) {
                console.info("PUSH ", peer.code, " TO WAITING");
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
        if (!this.videoStream && this.videoStreamError == false) {
            this.peerToDials.push(code);
            return;
        }

        if (!this.videoStream) {
            //videoStreamError == true
            ref.current.notifyCallTo();
            return;
        }
        console.debug("Will Create OFFER to: ", code);
        ref.current.createOffer(this.videoStream);
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
        this.setState({ room: room.clone() });
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

    initMediaStream = (redial: boolean = false) => {

        const config: MediaStreamConstraints = { video: videoConstraint, audio: true };

        let mediaStream = window.navigator.mediaDevices.getUserMedia(config)
        mediaStream
            .then((stream: MediaStream) => {
                this.setState({ errorMessage: undefined },
                    () => {
                        this.handleStream(stream, true);
                        if (redial == true) {
                            this.notifyUserEnterRoom();
                        }
                    });
            })
            .catch((e: any) => {
                console.error("ERROR INIT MEDIA STREAM: ", e);
                this.videoStreamError = true;
                this.setState({ errorMessage: new String(e).toString() })
            });

    }

    handleStream = (stream: MediaStream, updateVideoSrc: boolean = false) => {

        console.debug("START HANDLE STREAM, update videoSRC: ", updateVideoSrc);
        if (updateVideoSrc) {
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
        }
        this.videoStream = stream;
        this.videoStreamError = false;
        this.checkDialWaiting();
        this.checkOffersWaiting();
        console.debug("END HANDKE STREAM");
    }
    checkOffersWaiting = () => {
        console.debug("this.offersToHandle: ", this.offersToHandle.size);
        this.offersToHandle.forEach((data, origin) => {
            this.handleOffer(origin, data);
        })
        this.offersToHandle.clear();
    }
    checkDialWaiting = () => {
        console.debug("this.peerToDials: ", this.peerToDials.length);
        if (this.peerToDials.length == 0) return;
        this.peerToDials.forEach(this.dialPeerByCode);
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
    retryMediaStream = () => {
        this.initMediaStream(true);
    }

    render() {
        const user: User | undefined = this.getLoggedUser();
        if (!user) return null;
        return (
            <>
                {this.state.room ? <ChatMessagePanel room={this.state.room} /> : null}
                <div id="ConferenceRoomSteaming" className="section-body container-fluid" >

                    <h2>STREAMING Room</h2>
                    <div className="alert alert-info"  >
                        Welcome, <strong>{user.displayName}  </strong>
                    </div>
                    {this.state.loading ? <Spinner style={{ zIndex: 1000, position: 'absolute', width: '100%', marginTop: 20 }} />

                        : null}
                    {this.state.room ?
                        <Fragment>

                            <RoomInfo setLogEnabled={this.setLogEnabled} logEnabled={this.state.logEnabled} videoRef={this.videoRef} redialAll={this.notifyUserEnterRoom} memberRefs={this.memberRefs} user={user}
                                leaveRoom={this.leaveRoom} room={this.state.room} />
                            <p />
                            {this.state.errorMessage ?
                                <div>
                                    <SimpleError>Error: {this.state.errorMessage}</SimpleError>
                                    <AnchorWithIcon iconClassName="fas fa-redo" onClick={this.retryMediaStream}>Retry Media</AnchorWithIcon>
                                </div>
                                : null}
                            {/* <MemberList memberRefs={this.memberRefs} user={user} members={this.state.room.members} room={this.state.room} /> */}
                            <Card>
                                <div className="row">
                                    {this.state.room.members.map((member: User, i) => {
                                        member = UserModel.clone(member);
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
            </>
        )
    }
}

const RoomInfo = (props: { logEnabled: boolean, setLogEnabled(val: boolean): any, videoRef: React.RefObject<HTMLVideoElement>, redialAll(): any, memberRefs: Map<string, RefObject<MemberVideoStream>>, user: UserModel, room: ConferenceRoomModel, leaveRoom(): any }) => {
    const room: ConferenceRoomModel = ConferenceRoomModel.clone(props.room);
    return (
        <Card >
            <div className="row">
                <div className="col-md-4">
                    <video muted ref={props.videoRef} height={200} width={200} controls />
                </div>
                <div className="col-md-8">
                    <FormGroup label="Code">{room.code}</FormGroup>
                    <FormGroup label="Created" >{room.createdDate ? new Date(room.createdDate).toLocaleString() : "-"}</FormGroup>
                    <FormGroup label="Enable Log">
                        <ToggleButton active={props.logEnabled} onClick={props.setLogEnabled} />
                    </FormGroup>
                    <FormGroup>
                        <AnchorWithIcon className="btn btn-outline-danger" iconClassName="fas fa-sign-out-alt" onClick={props.leaveRoom}>
                            {props.room.isAdmin(props.user) ? "Invalidate" : "Leave"}</AnchorWithIcon>
                            &nbsp;
                        <AnchorWithIcon className="btn btn-outline-success" iconClassName="fas fa-phone" onClick={props.redialAll}>
                            Redial</AnchorWithIcon>
                    </FormGroup>
                </div>
            </div>
        </Card>
    )
}

export default withRouter(connect(
    mapCommonUserStateToProps
)(ConferenceRoomSteaming))