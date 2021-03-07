
import { contextPath } from '../constant/Url';
import { commonAjaxPostCalls } from './Promises';
import ChatMessageModel from './../models/ChatMessageModel';
import WebRequest from './../models/WebRequest';
export default class PublicConferenceService {
     
    nofityUserEnter(roomCode: string) {
        console.debug("nofityUserEnter: ", roomCode);
        const endpoint = contextPath().concat("api/member/conference/notifyuserenterroom/" + roomCode)
        return commonAjaxPostCalls(endpoint, {});
    }

    private static instance?: PublicConferenceService;

    static getInstance(): PublicConferenceService {
        if (this.instance == null) {
            this.instance = new PublicConferenceService();
        }
        return this.instance;
    }
    getRoom = () => {
        const endpoint = contextPath().concat("api/member/conference/getuserroom")
        return commonAjaxPostCalls(endpoint, {});
    }
    generateRoom = () => {
        const endpoint = contextPath().concat("api/member/conference/generateroom")
        return commonAjaxPostCalls(endpoint, {});
    }
    getRoomByCode = (code: string) => {
        const endpoint = contextPath().concat("api/member/conference/getroom/" + code)
        return commonAjaxPostCalls(endpoint, {});
    }
    enterRoom = (code: string) => {
        const endpoint = contextPath().concat("api/member/conference/enterroom/" + code)
        return commonAjaxPostCalls(endpoint, {});
    }
    leaveRoom = (code: string) => {
        const endpoint = contextPath().concat("api/member/conference/leaveroom/" + code)
        return commonAjaxPostCalls(endpoint, {});
    }
    removeRoomMember = (code: string) => {
        const endpoint = contextPath().concat("api/member/conference/removeroommember/" + code)
        return commonAjaxPostCalls(endpoint, {});
    }
    setActiveStatus = (active: boolean) => {
        const endpoint = contextPath().concat("api/member/conference/updateactivestatus/" + (active == true ? "true" : "false"))
        return commonAjaxPostCalls(endpoint, {});
    }
    sendChatMessage = (body: string, roomCode: string) => {
        const endpoint = contextPath().concat("api/member/conference/sendchat/");
        const message = new ChatMessageModel();
        message.body = body;
        message.roomCode = roomCode;
        const request: WebRequest = {
            chatMessage: message
        }
        return commonAjaxPostCalls(endpoint, request);
    }

    cleanResources = (stream?: MediaStream) => {

        if (!stream) return;
        console.debug("this.videoStream.getTracks(): ", stream.getTracks());
        stream.getTracks().forEach(stream => {
            stream.stop();
            console.debug("Clean track : ", stream.kind);
        })

    }


}