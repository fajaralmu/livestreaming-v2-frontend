import React, { Component } from 'react';
import Card from './../../../container/Card';
import UserModel from './../../../../models/UserModel';
import ConferenceRoomModel from './../../../../models/ConferenceRoomModel';
import { uniqueId } from './../../../../utils/StringUtil';
import { sendToWebsocket } from './../../../../utils/websockets';
import PeerConnection from '../../../../models/conference/PeerConnection';
import AnchorWithIcon from '../../../navigation/AnchorWithIcon';
interface Props {
    user: UserModel,
    member: UserModel,
    room: ConferenceRoomModel,
    redial(code: string): any
}
class State {
    videoVisible: boolean = false;
    logs: string[] = [];
}
export default class MemberVideoStream extends Component<Props, State> {

    trackAdded: boolean = false;
    rtcConfiguration: RTCConfiguration = {
        "iceServers": [
            { "urls": "stun:stun2.1.google.com:19302" }
            // ,{
            //       "urls":"${iceTurnServer.url}",
            //       "username": "${iceTurnServer.username}",
            //       "credential":"${iceTurnServer.password}"
            //     }
        ]
    };

    peerConnection?: PeerConnection;
    state: State = new State();
    videoRef: React.RefObject<HTMLVideoElement> = React.createRef();
    tracks: MediaStreamTrack[] = new Array();
    stream?: MediaStream;
    constructor(props) {
        super(props);
    }
    trackExist = (id: string) => {
        for (let i = 0; i < this.tracks.length; i++) {
            const track = this.tracks[i];
            if (track.id == id) { return true; }
        }
        return false;
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
        const logs = this.state.logs;
        logs.push(log);
        this.setState({ logs: logs });
    }
    getConnection = (newInstance: boolean = false): PeerConnection => {
        this.addLog("getPeerConnection newInstance: " + newInstance);
        if (this.peerConnection  && newInstance != true ) {
            return this.peerConnection;
        }
        console.debug("generate new RTCPeer Connection");
        this.tracks = []; 
        this.peerConnection = new PeerConnection(this.rtcConfiguration, this.getMember().code, this);
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

    handleOffer = (origin: string, offer, mediaStream: MediaStream) => {
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
        // peerConnection.createAnswer().then((answer: RTCSessionDescriptionInit) => {
        //     console.info("createAnswer to", origin);
        //     this.addLog("CREATE ANSWER TO :" + origin);
        //     peerConnection.setLocalDescription(answer).then((e) => {
        //         this.sendHandshake('answer', answer, origin);
        //     }).catch((e) => this.errorSessionDescription(e, "ANSWER"));

        // }).catch((e) => console.error("ERROR CREATE ANSWER: ", e));
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

    clearLog = () => this.setState({ logs: [] })
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
        return <div className="col-md-4 text-center">
            <Card title={
                <label>{member.displayName} {(room.isAdmin(member) ? <i className="fas fa-check" /> : "")}</label>}>
                <div><video height={100} width={100} controls ref={this.videoRef} /></div>
                <div className="btn-group">
                    <AnchorWithIcon className="btn btn-light btn-sm" iconClassName="fas fa-redo" onClick={this.redial} >Dial</AnchorWithIcon>
                    <AnchorWithIcon className="btn btn-light btn-sm" iconClassName="fas fa-trash" onClick={this.clearLog} >Clear Log</AnchorWithIcon>
                </div>
                {/* <div>
                    <p>local desc: {JSON.stringify(this.getPeerConnection().localDescription)}</p>
                    <p>remote desc: {JSON.stringify(this.getPeerConnection().remoteDescription)}</p>
                </div> */}
                <ol className="text-left" style={{ fontSize: '0.7em', color: '#000000' }}>
                    {this.state.logs.map((log, i) => {
                        return <li key={"log-" + i + "-" + member.code}>
                            <code>{log}</code>
                        </li>
                    })}
                </ol>
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