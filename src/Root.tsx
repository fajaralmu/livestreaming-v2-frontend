import React from 'react'
import App from './App'
import configureStore from './redux/configureStore'
import { HashRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
 
const Root = (props:any)  => {

    const store = configureStore();

    return (
        <Provider store={store}>
            <HashRouter>
                <App/>
            </HashRouter>
        </Provider>  

    );
}


export default Root;