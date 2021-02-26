import { SET_APPLICATION_PROFILE } from "../redux/types";

export const setApplicationProfileMiddleware = store => next => action => {
    if (!action.meta || action.meta.type !== SET_APPLICATION_PROFILE) { return next(action); }
    let newAction = Object.assign({}, action, { payload: action.payload });
    delete newAction.meta;
    store.dispatch(newAction);
}