

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

class State {
    loading: boolean = false;
    room?: ConferenceRoomModel;
}
class ConferenceMain extends BaseMainMenus {
    state: State = new State();
    publicConferenceService: PublicConferenceService;
    constructor(props: any) {
        super(props, "Conference", true);
        this.publicConferenceService = this.getServices().publicConferenceService;
    }

    recordLoaded = (response: WebResponse) => {
        this.setState({ room: response.conferenceRoom });
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
    setActiveStatus = (active:boolean) => {
        this.commonAjax(
            this.publicConferenceService.setActiveStatus,
            ()=>{
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
        this.setState({room:room});
    }
    componentDidMount() {
        super.componentDidMount();
        this.getRoom();
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
                        <Spinner style={{marginBottom:150}} /> :
                        <Fragment>
                            {room ?
                                <RoomInfo setActiveStatus={this.setActiveStatus} room={room} />
                                : <SimpleWarning className="text-center">
                                    <h4>No Data</h4>
                                    <AnchorWithIcon iconClassName="fas fa-video" children="Create" onClick={this.createRoom} />
                                </SimpleWarning>}
                            <AnchorWithIcon iconClassName="fas fa-sync" children="Reload" onClick={this.getRoom} />
                        </Fragment>}
                </Card>
            </div>
        )
    }
}
const RoomInfo = (props: { room: ConferenceRoomModel,setActiveStatus(val:boolean):any }) => {
    const room:ConferenceRoomModel = Object.assign(new ConferenceRoomModel, props.room);
    return (
        <div>
            <FormGroup label="Code">{room.code}</FormGroup>
            <FormGroup label="Created" >{room.createdDate?new Date(room.createdDate).toLocaleString():"-"}</FormGroup>
            <FormGroup label="Active">
                <ToggleButton active={room.active} onClick={props.setActiveStatus}/>
            </FormGroup>
            <FormGroup label="Members"/>
            <MemberList members={room.members} room={room} />
        </div>
    )
}
const MemberList = (props:{members:User[], room: ConferenceRoomModel,}) =>  {

    return (
        <table className="table">
             {tableHead("No", "Name", "Action")}
             <tbody>
                 {props.members.map((member, i) => {

                     return (
                         <tr key={"room_member_"+i} >
                             <td>{i+1}</td>
                             <td>{member.displayName} 
                             {props.room.isAdmin(member)? <i>&nbsp;- admin</i>:""}
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
)(ConferenceMain))