

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
        this.setState({ room: response.conferenceRoom });
    }
    startLoading = () => { this.setState({ loading: true }) }
    endLoading = () => { this.setState({ loading: false }) }
    getRoom = (e: FormEvent) => {
        e.preventDefault();
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
                    <Spinner /> : null}
            </div>
        )
    }
}

export default withRouter(connect(
    mapCommonUserStateToProps
)(ConferenceRoom))