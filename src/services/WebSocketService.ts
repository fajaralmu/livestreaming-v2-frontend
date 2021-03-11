
import { doItLater } from './../utils/EventUtil';
export default class WebSocketService {

    private static instance?: WebSocketService;

    static getInstance(): WebSocketService {
        if (this.instance == null) {
            this.instance = new WebSocketService();
        }
        return this.instance;
    }
    stompClient: any = undefined;
    wsConnected = false;
    websocketUrl = undefined;
    onConnectCallbacks = new Array();
    subscriptionCallbacks = new Array();
    isWsConnected = () => {
        return this.wsConnected == true;
    }
    setWebSocketUrl = (url) => {
        this.websocketUrl = url;
    }
    sendToWebsocket = (url, requestObject) => {
        if (!this.wsConnected || !this.stompClient) {
            console.info("Connecting");
            return false;
        }
        console.debug("SEND WEBSOCKET");
        try {
            this.stompClient.send(url, {}, JSON.stringify(requestObject));
            return true;
        } catch (e) {
            console.error("ERROR SEND WEBSOCKET TO", url, e);
            return false;
        }
    }
    removeOnConnecCallbacks = (...ids) => {
        for (let i = 0; i < ids.length; i++) {
            this.removeOnConnecCallback(ids[i]);
        }
    }
    /**
     * 
     * @param {string} id 
     */
    removeOnConnecCallback = (id) => {
        for (let i = 0; i < this.onConnectCallbacks.length; i++) {
            const c = this.onConnectCallbacks[i];
            if (c.id == id) {
                this.onConnectCallbacks.splice(i, 1);
                break;
            }
        }
    }
    onConnectCallbackExist = (callback) => {
        for (let i = 0; i < this.onConnectCallbacks.length; i++) {
            const c = this.onConnectCallbacks[i];
            if (c.id == callback.id) return true;
        }
        return false;
    }
    /**
     * each callback must provide uniquie ID
     * @param  {...any} callbacks 
     */
    addOnWsConnectCallbacks = (...callbacks) => {
        for (let i = 0; i < callbacks.length; i++) {
            const c = callbacks[i];
            if (!c.id) {
                console.warn("WS Onconncec callback must have ID!");
                continue;
            }
            if (!this.onConnectCallbackExist(c)) {
                console.debug("REgister on connect callback: ", c.id);
                this.onConnectCallbacks.push(c);
            }
        }
    }

    performWebsocketConnection = () => {
        const win = window as any;
        var socket = new win.SockJS(this.websocketUrl);
        try {
            if (this.stompClient) {
                this.stompClient.disconnect();
            }
        } catch (error) {

        }
        this.stompClient = win.Stomp.over(socket);
        this.stompClient.connect({}, (frame) => {
            this.wsConnected = true;
            // setConnected(true);
            // console.log('Websocket CONNECTED: ', websocketUrl, 'frame :', frame, stompClient.ws._transport.ws.url);
            console.debug("subscriptionCallbacks :", this.subscriptionCallbacks.length);
            // document.getElementById("ws-info").innerHTML =
            // stompClients.ws._transport.ws.url;
            for (let i = 0; i < this.subscriptionCallbacks.length; i++) {
                const c = this.subscriptionCallbacks[i];

                if (c) {

                    try {
                        this.stompClient.subscribe(c.subscribeUrl, (response) => {
                            var respObject = JSON.parse(response.body);
                            try {
                                c.callback(respObject);
                            } catch (e) {
                                console.error("ERROR SUBSCRIBE CALLBACK: ", c.id, e);
                            }
                        });
                    } catch (e) {
                        console.error("ERROR SUBSCRIBE: ", e);
                        // performWebsocketConnection();
                    }
                }
            }

            for (var i = 0; i < this.onConnectCallbacks.length; i++) {
                const c = this.onConnectCallbacks[i];
                if (c && c.callback) {
                    try {
                        c.callback(frame);
                    } catch (e) {
                        console.error("ERROR ONCONNECT CALLBACK: ", c.id, e);
                    }
                }
            }

        }, (e) => {
            console.warn("Error connection websocket, reconnect");
            doItLater(this.performWebsocketConnection, 2000);
        });

    }

    /**
     * 
     * @param {string} id 
     */
    removeWebsocketCallback = (id) => {
        console.debug("Remove WS Callback: ", id);
        for (let i = 0; i < this.subscriptionCallbacks.length; i++) {
            const existingCallback = this.subscriptionCallbacks[i];
            if (existingCallback.id == id) {
                this.subscriptionCallbacks.splice(i, 1);
                break;
            }
        }
    }

    /**
     * 
     * @param  {...WsCallback} callBackObjects 
     */
    registerWebSocketCallbacks = (...callBackObjects) => {
        // console.debug("callBackObjects: ", callBackObjects);
        if (null == callBackObjects) {
            return;
        }
        for (var i = 0; i < callBackObjects.length; i++) {
            const callback = callBackObjects[i];
            // console.debug("callback: ", callback);
            if (!this.subscriptionCallbackExist(callback)) {
                console.debug(" register callback id: ", callback.id);
                this.subscriptionCallbacks.push(callback);
            }
        }
    }

    /**
     * 
     * @param {id, subscribeUrl, callback} callback 
     */
    subscriptionCallbackExist = (callback) => {
        for (let i = 0; i < this.subscriptionCallbacks.length; i++) {
            const c = this.subscriptionCallbacks[i];
            if (c.id == callback.id) return true;
        }
        return false;
    }



}