import React, { Fragment, RefObject } from 'react'
import ConferenceRoomModel from '../../../../../models/ConferenceRoomModel';
import Card from '../../../../container/Card';
import FormGroup from '../../../../form/FormGroup';
import AnchorWithIcon from '../../../../navigation/AnchorWithIcon';
import ToggleButton from '../../../../navigation/ToggleButton';
import MemberVideoStream from '../MemberVideoStream';
import UserModel from '../../../../../models/UserModel';
import SimpleError from '../../../../alert/SimpleError';
import SimpleWarning from '../../../../alert/SimpleWarning';
export const MemberList = (props: {
    room: ConferenceRoomModel, user: UserModel,
    memberRefs: Map<string, React.RefObject<MemberVideoStream>>, dialPeerByCode(code: string): any
}) => {
    const user = props.user;
    const members: UserModel[] = props.room.members;
    return (
        <Card title={"Members (" + (members.length) + ")"}>
            <div className="container-fluid" style={{ overflow: 'scroll' }}>
                <div className="row">
                    {members.map((member: UserModel, i) => {
                        member = UserModel.clone(member);
                        if (!props.memberRefs.get(member.getCode())) {
                            props.memberRefs.set(member.getCode(), React.createRef());
                        }
                        return (
                            <MemberVideoStream redial={props.dialPeerByCode} ref={props.memberRefs.get(member.getCode())}
                                user={user} member={member}
                                room={props.room} key={"vid-stream-" + member.code} />
                        )
                    })}
                </div>
            </div>
        </Card>
    )
}
export const InfoMediaStreamMessage = (props: { message?: string }) => {
    if (!props.message) return null;
    return (
        <div className="alert alert-primary">{props.message}</div>
    )
}
export const ErrorMediaStreamMessage = (props: { message?: string, retry(): any }) => {
    if (!props.message) return null;
    return (

        <Fragment>
            <SimpleError>Error: {props.message}</SimpleError>
            <AnchorWithIcon iconClassName="fas fa-redo" onClick={props.retry}>Retry Media</AnchorWithIcon>
        </Fragment>

    )
}
export const RoomInfo = (props: { logEnabled: boolean, setLogEnabled(val: boolean): any, videoRef: React.RefObject<HTMLVideoElement>, redialAll(): any, memberRefs: Map<string, RefObject<MemberVideoStream>>, user: UserModel, room: ConferenceRoomModel, leaveRoom(): any }) => {
    const room: ConferenceRoomModel = (props.room).clone();
    const config = room.config;
    return (
        <Card >
            <div className="row">
                <div className="col-md-4">
                    {room.started?
                    <video muted ref={props.videoRef} height={200} width={200} controls />
                    : <SimpleWarning>Please Start MEDIA</SimpleWarning>
}
                </div>
                <div className="col-md-8">
                    <FormGroup label="Code">{room.code}</FormGroup>
                    <FormGroup label="Created" >{room.createdDate ? new Date(room.createdDate).toLocaleString() : "-"}</FormGroup>
                    <FormGroup label="Size">{config.videoWidth} x {config.videoHeight}</FormGroup>
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