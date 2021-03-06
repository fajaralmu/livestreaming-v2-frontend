

import React, { ChangeEvent } from 'react';
import { withRouter, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { mapCommonUserStateToProps } from '../../../../constant/stores';
import BaseMainMenus from '../../../layout/BaseMainMenus';
import User from '../../../../models/UserModel';
import '../Dashboard.css';
import Card from '../../../container/Card';

class DashboardMain extends BaseMainMenus {
    constructor(props: any) {
        super(props, "Dashboard", true);
    }

    render() {
        const user: User | undefined = this.getLoggedUser();
        if (!user) return null;
        return (
            <div id="DashboardMain" className="section-body container-fluid" >
                <h2>Dashboard</h2>
                <div className="row">
                    <Card className="col-md-3 bg-light border border-dark container-fluid text-dark">
                        Welcome,<p><strong>{user.displayName}  </strong>
                        </p>
                        <p className="badge badge-dark">{user.role?.toString().toLowerCase().split("_")[1]}</p>
                    </Card>
                    <Card className="col-md-3 bg-light border border-primary container-fluid text-center">
                        <Link to="/conference" className="text-primary " >
                            <h1><i className="fas fa-video" /></h1>
                            <h3>My Room</h3>
                        </Link>
                    </Card>
                    <Card className="col-md-3 bg-light border border-success container-fluid text-center">
                        <Link to="/conference/room" className="text-success ">
                            <h1><i className="fas fa-users" /></h1>
                            <h3>Join Room</h3>
                        </Link>
                    </Card>
                </div>
            </div>
        )
    }
}

export default withRouter(connect(
    mapCommonUserStateToProps
)(DashboardMain))