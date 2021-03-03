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
	console.debug("SEND WEBSOCKET");
	try {
	stompClient.send(url, {}, JSON.stringify(requestObject));
	return true;
	} catch (e) {
		console.error("ERROR SEND WEBSOCKET TO", url, e);
		return false;
	}
}
export const removeOnConnecCallbacks = (...ids) => {
	for (let i = 0; i < ids.length; i++) {
		removeOnConnecCallback(ids[i]);
	}
}
/**
 * 
 * @param {string} id 
 */
export const removeOnConnecCallback = (id) => {
	for (let i = 0; i < onConnectCallbacks.length; i++) {
		const c = onConnectCallbacks[i];
		if (c.id ==  id)  {
			onConnectCallbacks.splice(i, 1);
			break;
		}
	}
}
const onConnectCallbackExist = (callback) => {
	for (let i = 0; i < onConnectCallbacks.length; i++) {
		const c = onConnectCallbacks[i];
		if (c.id == callback.id) return true;
	}
	return false;
}
/**
 * each callback must provide uniquie ID
 * @param  {...any} callbacks 
 */
export const addOnWsConnectCallbacks = (...callbacks) => {
	for (let i = 0; i < callbacks.length; i++) {
		const c = callbacks[i];
		if (!c.id) {
			console.warn("WS Onconncec callback must have ID!");
			continue;
		}
		if (!onConnectCallbackExist(c)) {
			console.debug("REgister on connect callback: ", c.id);
			onConnectCallbacks.push(c);
		}
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
	stompClient = window.Stomp.over(socket);
	stompClient.connect({}, function (frame) {
		wsConnected = true;
		// setConnected(true);
		// console.log('Websocket CONNECTED: ', websocketUrl, 'frame :', frame, stompClient.ws._transport.ws.url);
		console.debug("subscriptionCallbacks :", subscriptionCallbacks.length);
		// document.getElementById("ws-info").innerHTML =
		// stompClients.ws._transport.ws.url;
		for (let i = 0; i < subscriptionCallbacks.length; i++) {
			const c = subscriptionCallbacks[i];

			if (c) {

				try {
					stompClient.subscribe(c.subscribeUrl, (response) => {
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

		for (var i = 0; i < onConnectCallbacks.length; i++) {
			const c = onConnectCallbacks[i];
			if (c && c.callback) {
				try {
					c.callback(frame);
				} catch (e) {
					console.error("ERROR ONCONNECT CALLBACK: ", c.id,  e);
				}
			}
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
		if (!subscriptionCallbackExist(callback)) {
			console.debug(" register callback id: ", callback.id);
			subscriptionCallbacks.push(callback);
		}
	}
}

/**
 * 
 * @param {id, subscribeUrl, callback} callback 
 */
const subscriptionCallbackExist = (callback) => {
	for (let i = 0; i < subscriptionCallbacks.length; i++) {
		const c = subscriptionCallbacks[i];
		if (c.id == callback.id) return true;
	}
	return false;
}


