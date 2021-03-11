import React, { ChangeEvent } from 'react'
import BaseComponent from './../../../BaseComponent';
import PublicConferenceService from './../../../../services/PublicConferenceService';
import { connect } from 'react-redux';
import { mapCommonUserStateToProps } from './../../../../constant/stores';
import FormGroup from '../../../form/FormGroup';
import ConferenceRoomModel from './../../../../models/ConferenceRoomModel';
import SimpleError from '../../../alert/SimpleError';
import WebResponse from './../../../../models/WebResponse';

class State {
    room?: ConferenceRoomModel;
}
class RoomInfoForm extends BaseComponent {
    state: State = new State();
    service: PublicConferenceService;
    constructor(props) {
        super(props, true);
        this.service = this.getServices().publicConferenceService;
    }
    onSubmit = () => {
        if (!this.state.room) return;
        this.showConfirmation("Save Data?")
        .then((ok)=>{
            if (!ok) return;
            this.commonAjax(
                this.service.updateRoomInfo,
                this.recordSaved,
                this.showCommonErrorAlert,
                this.state.room
            )
        })
       
    }
    recordSaved = (response:WebResponse) => {
        this.showInfo("Success")
        this.props.recordSavedCallback(response); 
    }
    componentDidMount() {
        this.setState({ room: this.props.room });
    }
    updateRoomProps = (e:ChangeEvent) => {
        
        const room = this.state.room;
        if (!room) return;
        const target = e.target as HTMLInputElement;
        const name = target.name;
        room[name] =target.value;
        this.setState({room:room});
    }
    render() {
        const room = this.state.room;
        if (!room) {
            return <SimpleError>Error: Room data is missing</SimpleError>
        }
        return (
            <form onSubmit={e => { e.preventDefault(); this.onSubmit() }}>
                <FormGroup label="EDIT ROOM DATA"/>
                <FormGroup label="Code">
                    <input onChange={this.updateRoomProps} name="code" value={room.code} className="form-control" />
                </FormGroup>
                <FormGroup>
                    <input type="submit" value="Save" className="btn btn-success" />
                </FormGroup>
            </form>
        )
    }
}

export default connect(
    mapCommonUserStateToProps
)(RoomInfoForm)
