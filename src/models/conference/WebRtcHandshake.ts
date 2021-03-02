
import WebRtcObject from './WebRtcObject';

export default class WebRtcHandshake {/**
    * 
    */

    origin: string = "";
    destination: string = "";
    eventId: string = "";
    webRtcObject: WebRtcObject = new WebRtcObject();
    roomCode: string = "";
    streamEnabled: boolean = true;
}