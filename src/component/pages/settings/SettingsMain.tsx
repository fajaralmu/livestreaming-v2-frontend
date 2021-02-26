

import  React, { Component, Fragment } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux'; 
import { mapCommonUserStateToProps } from '../../../constant/stores';
import BaseMainMenus from './../../layout/BaseMainMenus';

class SettingsMain extends BaseMainMenus 
{
    constructor(props:any){
        super(props, "Settings", true);
    }
    render(){
        return (
            <div id="SettingsMain" className="section-body container-fluid">
                <h2>Settings</h2>
                <div className="alert alert-info">
                    Welcome, <strong>{this.getLoggedUser()?.displayName}</strong>
                </div>
            </div>
        )
    }

}
const mapDispatchToProps = (dispatch: Function) => ({
  })
  

export default withRouter(connect(
    mapCommonUserStateToProps,
    mapDispatchToProps
  )(SettingsMain))