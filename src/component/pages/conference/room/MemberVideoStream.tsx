import React, { Component } from 'react';
import Card from './../../../container/Card';
import UserModel from './../../../../models/UserModel';
import ConferenceRoomModel from './../../../../models/ConferenceRoomModel';
import { uniqueId } from './../../../../utils/StringUtil';
import { sendToWebsocket } from './../../../../utils/websockets';
import PeerConnection from './../../../../models/PeerConnection';
import AnchorWithIcon from '../../../navigation/AnchorWithIcon';
interface Props {
 user:UserModel, 
 member:UserModel,
 room:ConferenceRoomModel,
 redial(code:string):any
}
class State{
    videoVisible:boolean = false;
}
export default class MemberVideoStream extends Component<Props, State> {

    rtcConfiguration: any = {
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
        "iceServers" : [ 
            { "urls":"stun:stun2.1.google.com:19302" } 
            // ,{
            //       "urls":"${iceTurnServer.url}",
            //       "username": "${iceTurnServer.username}",
            //       "credential":"${iceTurnServer.password}"
            //     }
        ]
    };
    logRef:React.RefObject<HTMLOListElement> = React.createRef();
    peerConnection?: PeerConnection;
    state:State = new State();
    videoRef: React.RefObject<HTMLVideoElement> = React.createRef();
    tracks:MediaStreamTrack [] = new Array();
    constructor(props) {
        super(props);
    }
    trackExist = (id:string) => {
        for (let i = 0; i < this.tracks.length; i++) {
            const track = this.tracks[i];
            if (track.id == id) {
                return true;
            }
        }
        return false;
    }
    addStream = (stream:MediaStream) => {
        try {
            console.debug("tracks: ", this.tracks);
            console.debug("WILL ADD Stream ", stream);
            console.debug("WILL ADD Tracks : ", stream.getTracks());
            const peerConnection = this.getPeerConnection();
            if (this.trackExist(stream.getTracks()[0].id) == false) {
                this.tracks.push(stream.getTracks()[0]);
                // console.debug("TRACK STREAM: ", stream.get)
                peerConnection.addTrack(stream.getTracks()[0], stream ); //audio
            }
            
            if (this.trackExist(stream.getTracks()[1].id) == false) {
                this.tracks.push(stream.getTracks()[1]);
                peerConnection.addTrack(stream.getTracks()[1], stream ); //video
            }
            console.debug("peerConnection.getSenders();: ", peerConnection.getSenders());
        } catch (e) {
            console.error("ERROR ADD TRACK: ",e);
        }
    }
    addLog = (log:string) => {
        if(this.logRef.current) {
            this.logRef.current.innerHTML =  this.logRef.current.innerHTML+"<li><code>"+log+"</code><li/>";
        }
    }
    getPeerConnection = ():PeerConnection => {
        if (this.peerConnection) {
            return this.peerConnection;
        }
        console.debug("generate new RTCPeer Connection")
        const peerConnection = new PeerConnection(this.rtcConfiguration);
        
        //TODO: onaddstream is deprecated, change to ontrack
        peerConnection.ontrack = (ev: RTCTrackEvent): any => {
            console.debug("=========== ON TRACk =========");
            console.debug("PeerConnectionthis.videoStream=> ", ev);
            console.debug("ev.track: ", ev.track);
            console.debug("stream: ", ev.streams);
            this.addLog("ON TRACK");
            const vid = this.videoRef.current;
            if (vid) {
                 
                vid.srcObject = ev.streams[0];
                vid.style.visibility = "visible";
                vid.addEventListener('canplay', function (ev) {
                    this.play();
                }, false);
            } else {
                console.debug("ON TRACK VIDEO NOT FOUND");
            }
            
            // log("PeerConnection End Add Stream => "+ requestId+" vid: "+(vid!=null));

        };
        peerConnection.onicecandidate = (event:RTCPeerConnectionIceEvent) => {
            console.debug("onicecandidate event: ", event);
            console.debug("peerConnection on ICE Candidate: ", event.candidate);
            // log("Peer IceCandidate ("+ requestId +")");
            if (event.candidate) {
                send(this.props.user.code, this.getMember().code ?? "",
                    this.getRoom().code ?? "", {
                    event: "candidate",
                    data: event.candidate
                });
            } else {
                console.warn("Candiate is NULL: ", event);
                // log("Peer IceCandidate IS NULL ("+ requestId +")");
            }
        };
        
        peerConnection.onsignalingstatechange = (e:Event) => {
            const state = peerConnection.signalingState;
            console.debug("PEER CONNECTION Signaling state: ", state);
            this.addLog("Peer SignalingState | "+state);
        }

        peerConnection.ondatachannel = function (ev) {
            console.debug("ondatachannel: ", ev);
            // initDataChannel(ev);
        }
        peerConnection.onicecandidateerror = function (e) {
            console.error("Error On Candidate: ", e);
        }
        peerConnection.onconnectionstatechange = (event) => {
            console.debug("Connection State: ", peerConnection.connectionState);
            switch (peerConnection.connectionState) {
                case "connected":
                    // The connection has become fully connected
                    break;
                case "disconnected":
                case "failed":
                    // One or more transports has terminated unexpectedly or in an error
                    break;
                case "closed":
                    // The connection has been closed
                    break;
            }
        }
        //	peerConnection.setConfiguration([rtcConfiguration]);
        this.peerConnection = peerConnection;
        return peerConnection;
    }

    componentDidMount = () => {
        if (this.videoRef.current) {
            this.videoRef.current.style.visibility = 'hidden';
        }
    }
    createOffer = (memberCode:string) => { 
        const peerConnection = this.getPeerConnection();

        peerConnection.createOffer().then((offer: RTCSessionDescriptionInit) => {
            this.addLog("CREATE OFFER TO :"+memberCode);
            peerConnection.setLocalDescription(offer);
            send(this.props.user?.code ?? "", memberCode,
                this.getRoom().code ?? "", {
                event: "offer",
                data: offer
            });
            //  .updatePeerConnection(requestId,peerConnection );
        }).catch((e)=>{
            console.error("ERROR CREATE OFFER: ", e);
        });
        // updatePeerConnection(requestId,peerConnection );
    }

    handleOffer = (origin:string, offer) => {
        this.addLog("GET OFFER FROM :"+origin);
        const peerConnection = this.getPeerConnection();
        // log(requestId+" handleOffer");
        if (!peerConnection) {
            return;
        }
        // console.debug(requestId, "handleOffer: ", offer);
        peerConnection.setRemoteDescription(new RTCSessionDescription(offer));

        console.debug("Will create answer");
        peerConnection.createAnswer().then((answer: RTCSessionDescriptionInit) => {
            console.debug("createAnswer: ", answer); 
            this.addLog("CREATE ANSWER TO :"+origin);
            peerConnection.setLocalDescription(answer);
            send(this.props.user.code ?? "", origin,
                this.getRoom().code ?? "", {
                event: "answer",
                data: answer
            });
            // _class.updatePeerConnection(requestId,peerConnection2 );
        }).catch((e)=>{
            console.error("ERROR CREATE ANSWER: ", e);
        });
        // updatePeerConnection(requestId,peerConnection );
    }
    clearLog = () => {
        if (this.logRef.current) {
            this.logRef.current.innerHTML = "";
        }
    }
    handleCandidate = (origin, candidate) => {
        this.addLog("GET CANDIDATE FROM :"+origin);
        const peerConnection = this.getPeerConnection();
        // console.debug(requestId, "handleCandidate: ", candidate);
        peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        // updatePeerConnection(requestId,peerConnection );
        // showVideoElement(requestId);
    }

    handleAnswer = (origin ,answer) => {
        this.addLog("GET ANSWER FROM :"+origin);
        const peerConnection = this.getPeerConnection();

        // console.debug(requestId, "handleAnswer: ", answer);
        if (peerConnection.signalingState == "stable") { // && this.videoStream) {
            // log("WILL ERROR? handle answer beacuse state is stable");
            //peerConnections[requestId]['connection'].addStream(this.videoStream); 
            this.addLog("SIGNALING STATE STABLE");
            //return;
        }

        peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
        // updatePeerConnection(requestId,peerConnection );
    }
    redial = () => {
        this.props.redial(this.getMember().code);
    }
    getMember = (): UserModel => {
        return this.props.member;
    }
    getRoom = (): ConferenceRoomModel => {
        return this.props.room;
    } 
    render() {
        if (!this.props.user) {
            console.debug("LOGGED USER: ", this.props.user);
            return <h3>NOT AUTHENTICATED</h3>
        }
        const room = this.getRoom();
        const user = this.getMember();
        return <div className="col-md-4">
            <Card title={user.displayName + (room.isAdmin(user) ? "-admin" : "")}>
             <video  height={100} width={100} controls  ref={this.videoRef} />
             <div className="btn-group">
                 <AnchorWithIcon iconClassName="fas fa-redo"
                        onClick={this.redial}
                 >Dial</AnchorWithIcon>
                 <AnchorWithIcon iconClassName="fas fa-trash" onClick={this.clearLog}
                 >Clear Log</AnchorWithIcon>
             </div>
             <ol ref={this.logRef}></ol>
        </Card></div>

    }
}   

const send = (origin: string, destination: string, roomCode: string, msg) => {
    const eventId = uniqueId();
    console.debug("SEND WEBSOCKET, event: ", msg.event);
    console.debug(">> SEND WEBSOCKET from ",origin," to " + destination + " | " + eventId + " :" + msg.event);
    //console.info("Send Audio Data");
    sendToWebsocket("/app/publicconference/webrtc", {
        realtimeHandshake : {
            //			originId : requestId,
            origin: origin,
            roomCode: roomCode,
            eventId: eventId,
            destination: destination,
            webRtcObject: (msg)
        }
    });
}