import * as appReducer from "./appReducer"
import * as userReducer from "./userReducer" 
import  * as servicesReducers from './servicesReducer';
import { combineReducers } from "redux";

export const rootReducer = combineReducers(
    {
        appState: appReducer.reducer,
        userState: userReducer.reducer, 
        servicesState: servicesReducers.reducer
    }
);

export const initialState = {
    appState: appReducer.initState,
    userState: userReducer.initState, 
    servicesState: servicesReducers.initState
}

export default rootReducer;