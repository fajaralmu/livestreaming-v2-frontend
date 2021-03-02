
export default class PeerConnection extends RTCPeerConnection {

    constructor(config?:RTCConfiguration | undefined) {
        super(config)
    }
    created:Date = new Date();
    updated?:Date; 
}