

import React  from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { mapCommonUserStateToProps } from '../../../../constant/stores';
import BaseMainMenus from '../../../layout/BaseMainMenus';
import User from '../../../../models/UserModel';

class ConferenceRoom extends BaseMainMenus {
    constructor(props: any) {
        super(props, "Conference", true);
    }

    render() {
        const user: User | undefined = this.getLoggedUser();
        if (!user) return null;
        return (
            <div id="ConferenceRoom" className="section-body container-fluid" >
                <h2>Conference Room</h2>
                <div className="alert alert-info">
                    Welcome, <strong>{user.displayName}  </strong>
                </div>
            </div>
        )
    }
}

export default withRouter(connect(
    mapCommonUserStateToProps
)(ConferenceRoom))