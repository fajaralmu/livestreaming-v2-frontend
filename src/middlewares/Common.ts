import {  getStore } from '../redux/configureStore';
export const commonAuthorizedHeader = () => {
    return {
        'Content-Type': 'application/json',
        'requestId': getRequestId(),//'localStorage.getItem("requestId")',
        'Authorization': 'Bearer '+getLoginKey()
    }
};
export const commonHeader = () => {
    return {
        'Content-Type': 'application/json',
        'requestId': getRequestId(), 
    }
};

const LOGIN_KEY:string = "arabic-club-login-key";
 
export const getAssetsPath = () :string => {
    const store = getStore(); 
    if (null == store) return "";
    const state = store.getState();
    return state.userState.assetsPath;
}

export const getRequestId = () :string => {
    const store = getStore();
    if (null == store) return "";
    const state = store.getState();
    return state.userState.requestId;
}
export const getLoginKey = () => {
    return getCookie(LOGIN_KEY);
}

export const updateAccessToken = (axiosResponse) => {
    if (axiosResponse && axiosResponse.headers && axiosResponse.headers['access-token']) {
        const accessToken = axiosResponse.headers['access-token'];
        // console.debug("update access token: ", accessToken);
        setCookie(LOGIN_KEY, accessToken);
    }
} 
export const setLoginKeyCookie = (cookieValue:any) => {
    setCookie(LOGIN_KEY, cookieValue);
}
export const setCookie = function (cname, cvalue, exdays=1) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}
export const getCookie = function (cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}