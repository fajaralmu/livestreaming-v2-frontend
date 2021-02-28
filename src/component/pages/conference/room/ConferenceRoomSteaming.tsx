

import React, { FormEvent } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { mapCommonUserStateToProps } from '../../../../constant/stores';
import BaseMainMenus from '../../../layout/BaseMainMenus';
import User from '../../../../models/UserModel';
import PublicConferenceService from '../../../../services/PublicConferenceService';
import FormGroup from '../../../form/FormGroup';
import ConferenceRoomModel from '../../../../models/ConferenceRoomModel';
import WebResponse from '../../../../models/WebResponse';
import Spinner from '../../../loader/Spinner';
import { tableHead } from '../../../../utils/CollectionUtil';
import SimpleWarning from '../../../alert/SimpleWarning';
import Card from '../../../container/Card';
import AnchorWithIcon from '../../../navigation/AnchorWithIcon';
class State {
    roomCode?: string;
    room?: ConferenceRoomModel;
    loading: boolean = false;
}
class ConferenceRoomSteaming extends BaseMainMenus {
    state: State = new State();
    publicConferenceService: PublicConferenceService;
    constructor(props: any) {
        super(props, "Conference", true);
        this.publicConferenceService = this.getServices().publicConferenceService;
    }
    recordLoaded = (response: WebResponse) => {
        this.setState({ room: response.conferenceRoom });
    }
    getRoomCodeFromProps = () => {
        if (!this.props.location.state) {
            this.props.history.push("/conference/room");
            return;
        }
        console.debug("this.props.location.state: ", this.props.location.state);
        const roomCode = this.props.location.state.roomCode;
        if (roomCode) {
            this.setState({roomCode:roomCode}, this.getRoom);
        } else {
            this.props.history.push("/conference/room");
        }
    }
    startLoading = () => { this.setState({ loading: true }) }
    endLoading = () => { this.setState({ loading: false }) }
    getRoom = (e?: FormEvent) => {
        if (e) {
            e.preventDefault();
        }
        if (!this.state.roomCode) {

            return;
        }
        this.commonAjax(
            this.publicConferenceService.getRoomByCode,
            this.recordLoaded,
            this.showCommonErrorAlert,
            this.state.roomCode
        )
    }
    componentDidMount() {
        if (!this.validateLoginStatus()){
            this.backToLogin();
            return;
        }
        this.getRoomCodeFromProps();
    }
    enterRoom = () => {
        if (!this.state.roomCode) return;
        this.props.history.push({
            pathname: "/conference/enterroom",
            state: { quiz:this.state.roomCode }
        })
    }
    render() {
        const user: User | undefined = this.getLoggedUser();
        if (!user) return null;
        return (
            <div id="ConferenceRoomSteaming" className="section-body container-fluid" >
                <h2>STREAMING Room</h2>
                <div className="alert alert-info">
                    Welcome, <strong>{user.displayName}  </strong> 
                </div>

                {this.state.loading ?
                    <Spinner /> :
                    this.state.room ?
                        <RoomInfo enterRoom={this.enterRoom} room={this.state.room} />
                        : <SimpleWarning children="No Data" />
                }
            </div>
        )
    }
}

const RoomInfo = (props: { room: ConferenceRoomModel, enterRoom():any }) => {
    const room: ConferenceRoomModel = Object.assign(new ConferenceRoomModel, props.room);
    return (
        <Card>
            <FormGroup label="Code">{room.code}</FormGroup>
            <FormGroup label="Created" >{room.createdDate ? new Date(room.createdDate).toLocaleString() : "-"}</FormGroup>
            <FormGroup label="Members" />
            <MemberList members={room.members} room={room} />
        </Card>
    )
}

const MemberList = (props: { members: User[], room: ConferenceRoomModel, }) => {

    return (
        <table className="table">
            {tableHead("No", "Name", "Action")}
            <tbody>
                {props.members.map((member, i) => {

                    return (
                        <tr key={"room_member_" + i} >
                            <td>{i + 1}</td>
                            <td>{member.displayName}
                                {props.room.isAdmin(member) ? <i>&nbsp;- admin</i> : ""}
                            </td>
                            <td></td>
                        </tr>
                    )
                })}
            </tbody>
        </table>
    )
}

export default withRouter(connect(
    mapCommonUserStateToProps
)(ConferenceRoomSteaming))