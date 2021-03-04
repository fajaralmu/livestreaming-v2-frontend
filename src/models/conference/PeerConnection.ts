
import MemberVideoStream from '../../component/pages/conference/room/MemberVideoStream';
/**
 * app.streaming.ice.iceStunServer=stun:206.253.167.195:3470
#app.streaming.ice.iceStunServer=stun:stun2.1.google.com:19302
app.streaming.ice.iceTurnServer=turn:206.253.167.195:3478
#app.streaming.ice.iceTurnServer=206.253.167.195:2222
app.streaming.ice.iceTurnServer.username=username1
app.streaming.ice.iceTurnServer.password=password1
 */
const config: RTCConfiguration = {
        "iceServers": [
            { "urls": "stun:stun2.1.google.com:19302" }
            ,{
                  "urls":"turn:206.253.167.195:3478",
                  "username": "username1",
                  "credential":"password1"
                }
        ]
    };
export default class PeerConnection extends RTCPeerConnection {
    performCreateAnswer(origin: string) {

        this.createAnswer().then((answer: RTCSessionDescriptionInit) => {
            
            this.component.addLog("CREATE ANSWER TO :" + origin);
            this.setLocalDescription(answer).then((e) => {
                this.component.sendHandshake('answer', answer, origin);
            }).catch((e) => this.component.errorSessionDescription(e, "ANSWER"));

        }).catch((e) => console.error("ERROR CREATE ANSWER: ", e));

    }

    memberCode: string;
    created: Date = new Date();
    updated?: Date;
    private component: MemberVideoStream;
    constructor( memberCode: string, comp: MemberVideoStream) {
        super(config);
        this.memberCode = memberCode;
        this.component = comp;
        this.initialize();
    }
    initialize = () => {
        this.ontrack = (ev: RTCTrackEvent): any => {
            console.debug("=========== ON TRACk =========");
            console.debug("ev.track: ", ev.track);
            console.debug("stream: ", ev.streams);
            this.component.addLog("ON TRACK");
            const vid = this.component.videoRef.current;
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
        this.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
            this.component.addLog("onicecandidate event");
            console.debug("peerConnection on ICE Candidate: ", event.candidate);
            if (event.candidate) {
                this.component.sendHandshake('candidate', event.candidate);
            } else {
                console.warn("Candiate is NULL: ", event);
            }
        };

        this.onsignalingstatechange = (e: Event) => {
            const state = this.signalingState;
            console.debug("PEER CONNECTION Signaling state: ", state);
            this.component.addLog("Peer SignalingState | " + state);
            if (state == 'stable') {
                console.debug("STABLE RTCPeerConnection: ", this);
            }
        }

        this.ondatachannel =   (e) => {
            console.debug("ondatachannel: ", this.memberCode, e);
            // initDataChannel(ev);
        }
        this.onicecandidateerror =  (e) => {
            console.error("Error On Candidate: ", this.memberCode, e);
        }
        this.onconnectionstatechange = function (event) {
            console.debug("Connection State: ", this.connectionState);
            switch (this.connectionState) {
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
    }

    senderInfo = (): string => {
        let info: string = " Sender : ";
        for (let i = 0; i < this.getSenders().length; i++) {
            const sender = this.getSenders()[i];
            try {
                info += " - KIND: " + sender.track?.kind;
            } catch (error) {

            }
        }
        return info;
    }

    performCreateOffer(trackAdded: boolean) {

        this.createOffer().then((offer: RTCSessionDescriptionInit) => {
            this.component.addLog("CREATE OFFER TO :" + this.memberCode + "this.trackAdded: " + trackAdded + this.senderInfo())//+ this.trackAdded + " > " + this.tracks.length);
            this.setLocalDescription(offer).then((value) => {
                this.component.sendHandshake('offer', offer);
            }).catch((e) => this.component.errorSessionDescription(e, "CREATE OFFER"));
            //  .updatePeerConnection(requestId,peerConnection );
        }).catch((e) => {
            console.error("ERROR CREATE OFFER: ", e);
        });
    }

}