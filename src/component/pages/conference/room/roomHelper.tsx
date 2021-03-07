import React, { RefObject } from 'react'
import ConferenceRoomModel from './../../../../models/ConferenceRoomModel';
import Card from './../../../container/Card';
import FormGroup from './../../../form/FormGroup';
import AnchorWithIcon from './../../../navigation/AnchorWithIcon';
import ToggleButton from './../../../navigation/ToggleButton';
import MemberVideoStream from './MemberVideoStream';
import UserModel from './../../../../models/UserModel';

export  const RoomInfo = (props: { logEnabled: boolean, setLogEnabled(val: boolean): any, videoRef: React.RefObject<HTMLVideoElement>, redialAll(): any, memberRefs: Map<string, RefObject<MemberVideoStream>>, user: UserModel, room: ConferenceRoomModel, leaveRoom(): any }) => {
    const room: ConferenceRoomModel = ConferenceRoomModel.clone(props.room);
    return (
        <Card >
            <div className="row">
                <div className="col-md-4">
                    <video muted ref={props.videoRef} height={200} width={200} controls />
                </div>
                <div className="col-md-8">
                    <FormGroup label="Code">{room.code}</FormGroup>
                    <FormGroup label="Created" >{room.createdDate ? new Date(room.createdDate).toLocaleString() : "-"}</FormGroup>
                    <FormGroup label="Enable Log">
                        <ToggleButton active={props.logEnabled} onClick={props.setLogEnabled} />
                    </FormGroup>
                    <FormGroup>
                        <AnchorWithIcon className="btn btn-outline-danger" iconClassName="fas fa-sign-out-alt" onClick={props.leaveRoom}>
                            {props.room.isAdmin(props.user) ? "Invalidate" : "Leave"}</AnchorWithIcon>
                            &nbsp;
                        <AnchorWithIcon className="btn btn-outline-success" iconClassName="fas fa-phone" onClick={props.redialAll}>
                            Redial</AnchorWithIcon>
                    </FormGroup>
                </div>
            </div>
        </Card>
    )
}