import React, { Component, Fragment } from 'react';
import Card from './../../../container/Card';
import UserModel from './../../../../models/UserModel';
import ConferenceRoomModel from './../../../../models/ConferenceRoomModel';
import { uniqueId } from './../../../../utils/StringUtil';
import { sendToWebsocket } from './../../../../utils/websockets';
import PeerConnection from '../../../../models/conference/PeerConnection';
import AnchorWithIcon from '../../../navigation/AnchorWithIcon';
import HandshakeLog from './HandshakeLog';
import ToggleButton from '../../../navigation/ToggleButton';
interface Props {
    user: UserModel, member: UserModel,
    room: ConferenceRoomModel, redial(code: string): any
}
class State {
    videoVisible: boolean = false;
    showLog:boolean= false;
   
}
export default class MemberVideoStream extends Component<Props, State> {
   
    trackAdded: boolean = false; 
    peerConnection?: PeerConnection;
    logRef: React.RefObject<HandshakeLog> = React.createRef();
    videoRef: React.RefObject<HTMLVideoElement> = React.createRef();
    tracks: MediaStreamTrack[] = new Array();
    stream?: MediaStream;
    constructor(props) {
        super(props);
        this.state = new State();
    }
    trackExist = (id: string) => {
        for (let i = 0; i < this.tracks.length; i++) {
            const track = this.tracks[i];
            if (track.id == id) { return true; }
        }
        return false;
    }
    setLogEnabled = (val: boolean) => {
        if (this.logRef.current) {
            this.logRef.current.setLogEnabled(val);
        }
    }

    private addStream = (stream: MediaStream) => {
        try {
            const peerConnection = this.getConnection();
            if (this.trackExist(stream.getTracks()[0].id) == false) {
                this.tracks.push(stream.getTracks()[0]);
                // console.debug("TRACK STREAM: ", stream.get)
                peerConnection.addTrack(stream.getTracks()[0], stream); //audio
                this.addLog("Add Track: " + stream.getTracks()[0].kind);
            }

            if (this.trackExist(stream.getTracks()[1].id) == false) {
                this.tracks.push(stream.getTracks()[1]);
                peerConnection.addTrack(stream.getTracks()[1], stream); //video
                this.addLog("Add Track: " + stream.getTracks()[1].kind);
            }
            this.trackAdded = true;
            this.stream = stream;
        } catch (e) {
            console.error("ERROR ADD TRACK: ", e);
        }
    }
    addLog = (log: string) => {
        if (this.logRef.current) {
            this.logRef.current.addLog(log);
        }
    }
    getConnection = (newInstance: boolean = false): PeerConnection => {
        this.addLog("getPeerConnection newInstance: " + newInstance);
        if (this.peerConnection && newInstance != true) {
            return this.peerConnection;
        }
        console.debug("generate new RTCPeer Connection");
        this.tracks = [];
        this.peerConnection = new PeerConnection( this.getMember().code, this);
        return this.peerConnection;
    }

    sendHandshake = (event: string, data: any, destination?: string) => {
        send(this.props.user.code, destination ?? (this.getMember().code ?? "UNDEFINED"),
            this.getRoom().code, {
            event: event,
            data: data
        });
    }

    componentDidMount = () => {
        if (this.videoRef.current) {
            this.videoRef.current.style.visibility = 'hidden';
        }
    }

    createOffer = (stream: MediaStream) => {
        const peerConnection = this.getConnection(true);
        this.addStream(stream);
        peerConnection.performCreateOffer(this.trackAdded);
    } 

    errorSessionDescription = (error, type: string) => {
        console.error("ERROR SET SESSION DESCRIPTION while ", type, ": ", error);
    }
    requestDial = () => {
        this.addLog("REQUEST CALLING FROM :" +this.getMember().code);
        this.sendHandshake('dial', {});
    }

    handleOffer = (origin: string, offer, mediaStream?: MediaStream) => {
        this.addLog("GET OFFER FROM :" + origin + ", this.trackAdded: " + this.trackAdded + " > " + this.tracks.length);
        const peerConnection = this.getConnection(true);
        if (mediaStream) {
            this.addStream(mediaStream);
        } else {
            this.addLog("GET OFFER mediaStream missing");
        }
        // this.reAddStream();
        peerConnection.setRemoteDescription(offer).then((val) => {
            this.createAnswer(origin);
        }).catch((e) => this.errorSessionDescription(e, "HANDLE OFFER"));
    }

    createAnswer = (origin: string) => {
        const peerConnection = this.getConnection();
        peerConnection.performCreateAnswer(origin);
    }

    handleCandidate = (origin: string, candidate) => {
        this.addLog("GET CANDIDATE FROM :" + origin);
        this.getConnection().addIceCandidate(new RTCIceCandidate(candidate))
            .catch((e) => this.errorSessionDescription(e, "HANDLE CANDIDATE"));
    }

    handleAnswer = (origin: string, answer) => {
        this.addLog("GET ANSWER FROM :" + origin);
        this.getConnection().setRemoteDescription((answer))
            .catch((e) => this.errorSessionDescription(e, "SET ANSWER"));

    }

    toggleLog = (show:boolean) =>{this.setState({showLog: show})}
    isCurrentUser = (): boolean => this.props.user.code == this.props.member.code;
    redial = () => this.props.redial(this.getMember().code);
    getMember = (): UserModel => this.props.member
    getRoom = (): ConferenceRoomModel => this.props.room;

    render() {
        if (!this.props.user) {
            console.debug("LOGGED USER: ", this.props.user);
            return <h3>NOT AUTHENTICATED</h3>
        }
        const room = this.getRoom();
        const member = this.getMember();
        return <div className="col-md-3 text-center">
            <Card title={
                <label style={{fontSize:'0.8em'}}>{member.displayName} {(room.isAdmin(member) ? <i className="fas fa-check" /> : "")}</label>}>
                <div>
                    {this.isCurrentUser() ?
                        <h2>You</h2> :
                        <Fragment>
                            <video height={100} width={100} controls ref={this.videoRef} />
                            <br />
                            <AnchorWithIcon className="btn btn-light btn-sm" iconClassName="fas fa-phone" onClick={this.redial} >Dial</AnchorWithIcon>
                        </Fragment>
                    }</div>
                {/* <p>{this.peerConnection?.senderInfo()}</p> */}
                {/* <div>
                    <p>local desc: {JSON.stringify(this.getPeerConnection().localDescription)}</p>
                    <p>remote desc: {JSON.stringify(this.getPeerConnection().remoteDescription)}</p>
                </div> */}
                <ToggleButton yesLabel="Show Log" active={this.state.showLog} onClick={this.toggleLog} noLabel="Hide Log" />
                <HandshakeLog show={this.state.showLog} ref={this.logRef} />
            </Card></div>

    }
}

const send = (origin: string, destination: string, roomCode: string, msg) => {
    const eventId = uniqueId();
    console.debug("SEND WEBSOCKET, event: ", msg.event);
    console.debug(">> SEND WEBSOCKET from ", origin, " to " + destination + " | " + eventId + " :" + msg.event);
    //console.info("Send Audio Data");
    sendToWebsocket("/app/publicconference/webrtc", {
        realtimeHandshake: {
            //			originId : requestId,
            origin: origin,
            roomCode: roomCode,
            eventId: eventId,
            destination: destination,
            webRtcObject: (msg)
        }
    });
}