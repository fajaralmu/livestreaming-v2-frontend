import * as types from './types'

export const initState = { 
    mainApp: undefined

};

export const reducer = (state = initState, action) => {
    switch (action.type) {
        case types.SET_MAIN_APP:
              
            return { ...state, mainApp: action.payload }; 
       
        default:
            return state;
    }
}

export default reducer;