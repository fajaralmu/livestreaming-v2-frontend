

import React, { FormEvent } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { mapCommonUserStateToProps } from '../../../../constant/stores';
import BaseMainMenus from '../../../layout/BaseMainMenus';
import User from '../../../../models/UserModel';
import PublicConferenceService from './../../../../services/PublicConferenceService';
import FormGroup from '../../../form/FormGroup';
import ConferenceRoomModel from './../../../../models/ConferenceRoomModel';
import WebResponse from './../../../../models/WebResponse';
import Spinner from './../../../loader/Spinner';
import { tableHead } from './../../../../utils/CollectionUtil';
import SimpleWarning from '../../../alert/SimpleWarning';
import Card from './../../../container/Card';
import AnchorWithIcon from '../../../navigation/AnchorWithIcon';
class State {
    roomCode?: string;
    room?: ConferenceRoomModel;
    loading: boolean = false;
}
class ConferenceRoom extends BaseMainMenus {
    state: State = new State();
    publicConferenceService: PublicConferenceService;
    constructor(props: any) {
        super(props, "Conference", true);
        this.publicConferenceService = this.getServices().publicConferenceService;
    }
    recordLoaded = (response: WebResponse) => {
        if (this.hasCodeOnURI()) {
            this.enterRoom();
            return;
        }
        this.setState({ room: response.conferenceRoom });
    }
    startLoading = () => { this.setState({ loading: true }) }
    endLoading = () => { this.setState({ loading: false }) }
    getRoom = (e?: FormEvent) => {
        if (e) { e.preventDefault(); }
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
    enterRoom = () => {
        if (!this.state.roomCode) return;
        this.props.history.push({
            pathname: "/conference/enterroom",
            state: { roomCode:this.state.roomCode }
        })
    }
    componentDidMount () {
        super.componentDidMount();
        if (this.hasCodeOnURI()) {
            this.setState({roomCode: this.props.match.params.code}, this.getRoom);
        }
    }
    hasCodeOnURI = () => {
        return  this.props.match.params.code != undefined;
    }
    render() {
        const user: User | undefined = this.getLoggedUser();
        if (!user) return null;
        
        return (
            <div id="ConferenceRoom" className="section-body container-fluid" >
                <h2>Conference Room</h2>
                <div className="alert alert-info">
                    Welcome, <strong>{user.displayName}  </strong>
                    <form onSubmit={this.getRoom}>
                        <FormGroup label="Code">
                            <input required className="form-control" name="roomCode"
                                onChange={this.handleInputChange}
                            />
                        </FormGroup>
                        <FormGroup>
                            <input type="submit" className="btn btn-success" />
                        </FormGroup>
                    </form>
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
            <FormGroup label="Active">
                {room.active == true ? "Yes" : "No"}
            </FormGroup>
            <FormGroup  >
                <AnchorWithIcon onClick={props.enterRoom}>
                    Enter Room
                </AnchorWithIcon>
            </FormGroup>
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
)(ConferenceRoom))