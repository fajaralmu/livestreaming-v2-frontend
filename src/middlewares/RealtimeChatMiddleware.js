import * as common from './Common'
import * as types from '../redux/types'

const POST_METHOD = "post"; 

export const getMessagesMiddleware = store => next => action => {
    if (!action.meta || action.meta.type !== types.GET_MESSAGE) { return next(action); }
    fetch(action.meta.url, {
        method: POST_METHOD, body: JSON.stringify(action.payload),
        headers: common.commonAuthorizedHeader()
    }).then(response => response.json())
        .then(data => {
            console.debug("sendChatMessageMiddleware Response:", data);
            let newAction = Object.assign({}, action, { payload: data });
            delete newAction.meta;
            store.dispatch(newAction);
        })
        .catch(err => console.log(err)).finally(param => action.meta.app.endLoading());
}
 
export const storeChatMessageLocallyMiddleware = store => next => action => {
    if (!action.meta || action.meta.type !== types.STORE_MESSAGE) { return next(action); }
    let newAction = Object.assign({}, action, { payload: action.payload });
    delete newAction.meta;
    store.dispatch(newAction);
} 

