

import React, { Fragment } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { mapCommonUserStateToProps } from '../../../../constant/stores';
import BaseMainMenus from '../../../layout/BaseMainMenus';
import User from '../../../../models/UserModel';
import Card from '../../../container/Card';
import PublicConferenceService from './../../../../services/PublicConferenceService';
import ConferenceRoomModel from './../../../../models/ConferenceRoomModel';
import WebResponse from './../../../../models/WebResponse';
import Spinner from '../../../loader/Spinner';
import SimpleWarning from '../../../alert/SimpleWarning';
import AnchorWithIcon from '../../../navigation/AnchorWithIcon';
import FormGroup from '../../../form/FormGroup';
import ToggleButton from '../../../navigation/ToggleButton';
import { tableHead } from './../../../../utils/CollectionUtil';
import RoomInfoForm from './RoomInfoForm';

class State {
    loading: boolean = false;
    room?: ConferenceRoomModel;
    editMode: boolean = false;
}
class ConferenceMain extends BaseMainMenus {
    state: State = new State();
    publicConferenceService: PublicConferenceService;
    constructor(props: any) {
        super(props, "Conference", true);
        this.publicConferenceService = this.getServices().publicConferenceService;
    }

    recordLoaded = (response: WebResponse) => {
        if (response.conferenceRoom) {
            this.setState({ room: Object.assign(new ConferenceRoomModel, response.conferenceRoom) });
        }
    }
    startLoading = () => { this.setState({ loading: true }) }
    endLoading = () => { this.setState({ loading: false }) }
    getRoom = () => {
        this.commonAjax(
            this.publicConferenceService.getRoom,
            this.recordLoaded,
            this.showCommonErrorAlert
        )
    }
    createRoom = () => {
        this.commonAjax(
            this.publicConferenceService.generateRoom,
            this.recordLoaded,
            this.showCommonErrorAlert
        )
    }
    setActiveStatus = (active: boolean) => {
        this.commonAjax(
            this.publicConferenceService.setActiveStatus,
            () => {
                this.activeStatusChanged(active);
            },
            this.showCommonErrorAlert,
            active
        )
    }
    activeStatusChanged = (active: boolean) => {
        const room = this.state.room;
        if (!room) return;
        room.active = active;
        this.setState({ room: room });
    }
    componentDidMount() {
        super.componentDidMount();
        this.getRoom();
    }
    enterRoom = () => {
        if (!this.state.room) return;
        this.props.history.push({
            pathname: "/conference/enterroom",
            state: { roomCode: this.state.room.code }
        })
    }
    removeMember = (member: User) => {
        this.showConfirmationDanger("Remove " + member.displayName + "?")
            .then(ok => {
                if (!ok) return;
                this.doRemoveMember(member);
            })
    }
    memberRemoved = (response: WebResponse, member: User) => {
        const room = this.state.room;
        if (!room) return;
        room.removeMember(member);
        this.setState({ room: room });
    }
    doRemoveMember = (m: User) => {
        this.commonAjax(
            this.publicConferenceService.removeRoomMember,
            (r) => this.memberRemoved(r, m),
            this.showCommonErrorAlert,
            m.code
        )
    }
    render() {
        const user: User | undefined = this.getLoggedUser();
        if (!user) return null;
        const room = this.state.room;
        return (
            <div id="ConferenceMain" className="section-body container-fluid" >
                <h2>Conference Main</h2>
                <div className="alert alert-info">
                    Welcome, <strong>{user.displayName}  </strong>
                </div>
                <Card title="My Room">
                    {this.state.loading ?
                        <Spinner style={{ marginBottom: 150 }} /> :
                        <Fragment>
                            {room ?
                                <>
                                    <FormGroup label="Edit Mode">
                                        <ToggleButton active={this.state.editMode} onClick={val => this.setState({ editMode: val })}/>
                                    </FormGroup>
                                    {this.state.editMode ?
                                        <RoomInfoForm recordSavedCallback={this.recordLoaded} room={room} />
                                        :
                                        <RoomInfo enterRoom={this.enterRoom} removeMember={this.removeMember}
                                            setActiveStatus={this.setActiveStatus} room={room} />
                                    }

                                </>
                                : <SimpleWarning className="text-center">
                                    <h4>No Data</h4>
                                    <AnchorWithIcon iconClassName="fas fa-video" children="Create" onClick={this.createRoom} />
                                </SimpleWarning>}
                            <AnchorWithIcon show={this.state.editMode==false} iconClassName="fas fa-sync" children="Reload" onClick={this.getRoom} />
                        </Fragment>}
                </Card>
            </div>
        )
    }
}
const RoomInfo = (props: { room: ConferenceRoomModel, removeMember(member: User): any, setActiveStatus(val: boolean): any, enterRoom(): any }) => {
    const room: ConferenceRoomModel = Object.assign(new ConferenceRoomModel, props.room);
    return (
        <div>
            <FormGroup label="Code">{room.code}</FormGroup>
            <FormGroup label="Created" >{room.createdDate ? new Date(room.createdDate).toLocaleString() : "-"}</FormGroup>
            <FormGroup label="Active">
                <ToggleButton active={room.active} onClick={props.setActiveStatus} />
            </FormGroup>
            {room.active ?
                <FormGroup><AnchorWithIcon className="btn btn-warning btn-sm" onClick={props.enterRoom} children="Enter Room" /></FormGroup> : null}
            <FormGroup label="Members" />
            <MemberList removeMember={props.removeMember} members={room.members} room={room} />
        </div>
    )
}
const MemberList = (props: { members: User[], removeMember(member: User): any, room: ConferenceRoomModel, }) => {

    return (
        <table className="table">
            {tableHead("No", "Name", "Action")}
            <tbody>
                {props.members.map((member, i) => {
                    const isAdmin = props.room.isAdmin(member);
                    return (
                        <tr key={"room_member_" + i} >
                            <td>{i + 1}</td>
                            <td>{member.displayName}
                                {isAdmin ? <i>&nbsp;- admin</i> : ""}
                            </td>
                            <td>
                                {isAdmin ? null :
                                    <AnchorWithIcon onClick={e => props.removeMember(member)} iconClassName="fas fa-times" className="btn btn-danger btn-sm" children="Remove" />
                                }
                            </td>
                        </tr>
                    )
                })}
            </tbody>
        </table>
    )
}
export default withRouter(connect(
    mapCommonUserStateToProps
)(ConferenceMain))