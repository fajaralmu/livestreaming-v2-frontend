import { createStore, applyMiddleware } from 'redux'
import { initialState, rootReducer } from './reducers' 
import * as userMiddleware from '../middlewares/UserMiddleware' 
import * as realtimeChatMiddleware from '../middlewares/RealtimeChatMiddleware' 
 
let store = null;
export const getStore = () => {
    return store;
}
export const configureStore = () => {
    store = createStore(
        rootReducer,
        initialState,
        applyMiddleware(   

            //user related
            userMiddleware.performLoginMiddleware,
            userMiddleware.performLogoutMiddleware,  
            userMiddleware.getLoggedUserMiddleware, 
            userMiddleware.setLoggedUserMiddleware,
 

            /*realtime chat*/
            realtimeChatMiddleware.storeChatMessageLocallyMiddleware,
            realtimeChatMiddleware.getMessagesMiddleware,

        )
    );

    return store;
}
   

export default configureStore;