import { exists } from 'fs';
import { doItLater } from './EventUtil';

let stompClient = undefined; 
let wsConnected = false;
let websocketUrl = undefined;
const onConnectCallbacks = new Array();
const subscriptionCallbacks = new Array();
export const isWsConnected = () => {
	return wsConnected == true;
}
export const setWebSocketUrl = (url) => {
	websocketUrl = url;
}
export const sendToWebsocket = (url, requestObject) => {
	if (!wsConnected || !stompClient) {
		console.info("Connecting");
		return false;
	}
	console.debug("SEND WEBSOCKET")
	stompClient.send(url, {}, JSON.stringify(requestObject));
	return true;
}

export const addOnWsConnectCallbacks = (...callbacks) => {
	for (let i = 0; i < callbacks.length; i++) {
		const element = callbacks[i];
		onConnectCallbacks.push(element);
	}
}

export const performWebsocketConnection = () => {
	var socket = new window.SockJS(websocketUrl);
	try {
		if (stompClient) {
			stompClient.disconnect();
		}
	} catch (error) {
		
	}
	stompClient  = window.Stomp.over(socket);
	stompClient .connect({}, function (frame) {
		wsConnected = true;
		// setConnected(true);
		console.log('Websocket CONNECTED: ', websocketUrl, 'frame :', frame, stompClient.ws._transport.ws.url);
		console.debug("subscriptionCallbacks :", subscriptionCallbacks.length);
		// document.getElementById("ws-info").innerHTML =
		// stompClients.ws._transport.ws.url;
		for (let i = 0; i < subscriptionCallbacks.length; i++) {
			const callBackObject = subscriptionCallbacks[i];

			if (callBackObject) {

				stompClient.subscribe(callBackObject.subscribeUrl, (response) => {
					var respObject = JSON.parse(response.body);
					callBackObject.callback(respObject);
				});
			}
		}

		for (var i = 0; i < onConnectCallbacks.length; i++) {
			const callback = onConnectCallbacks[i];
			callback(frame);
		}

	}, (e) => {
		console.warn("Error connection websocket, reconnect");
		doItLater(performWebsocketConnection, 2000);
	}); 
	 
}

/**
 * 
 * @param {string} id 
 */
export const removeWebsocketCallback = (id) => {
	console.debug("Remove WS Callback: ", id);
	for (let i = 0; i < subscriptionCallbacks.length; i++) {
		const existingCallback = subscriptionCallbacks[i];
		if (existingCallback.id == id) {
			subscriptionCallbacks.splice(i, 1);
			break;
		}
	}
}

 /**
  * 
  * @param  {...WsCallback} callBackObjects 
  */
export const registerWebSocketCallbacks = (...callBackObjects) => {
	// console.debug("callBackObjects: ", callBackObjects);
	if (null == callBackObjects) {
		return;
	}
	for (var i = 0; i < callBackObjects.length; i++) {
		const callback = callBackObjects[i];
		// console.debug("callback: ", callback);
		if (!callbackExist(callback)) {
			console.debug(" register callback id: ", callback.id);
			subscriptionCallbacks.push(callback);
		}
	}
}

/**
 * 
 * @param {id, subscribeUrl, callback} callback 
 */
const callbackExist = (callback ) => {
	for (let i = 0; i < subscriptionCallbacks.length; i++) {
		const existingCallback = subscriptionCallbacks[i];
		if (existingCallback.id == callback.id) return true;
	}
	return false;
}
