 
import Services from './../services/Services';

export const initState: { services: Services } = {
    services: new Services()

};

export const reducer = (state = initState, action) => {

    return state;
}

export default reducer;