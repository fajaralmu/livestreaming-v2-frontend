import React from 'react';
import BaseComponent from './../../../BaseComponent';
import { mapCommonUserStateToProps } from './../../../../constant/stores';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import Card from './../../../container/Card';
import UserModel from './../../../../models/UserModel';
import ConferenceRoomModel from './../../../../models/ConferenceRoomModel';

export class MemberVideoStream extends BaseComponent {

    constructor(props) {
        super(props, true);
    }
    getMember = (): UserModel => {
        return this.props.member;
    }
    getRoom = (): ConferenceRoomModel => {
        return this.props.room;
    }
    render() {
        const room = this.getRoom();
        const user = this.getMember();
        return <div className="col-md-4"><Card title={user.displayName + (room.isAdmin(user)?"-admin":"")}>

        </Card></div>

    }
} export default withRouter(connect(
    mapCommonUserStateToProps
)(MemberVideoStream))