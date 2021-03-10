import React, { ChangeEvent } from 'react'
import BaseComponent from '../../../../BaseComponent';
import PublicConferenceService from '../../../../../services/PublicConferenceService';
import { connect } from 'react-redux';
import { mapCommonUserStateToProps } from '../../../../../constant/stores';

class ChatFormState {
    showChat: boolean = false;
    chatBody: string = "";
    unreadCount: number = 0;
    loading: boolean = false;
}
class ChatForm extends BaseComponent {
    state: ChatFormState = new ChatFormState();
    publicConferenceService: PublicConferenceService;
    constructor(props) {
        super(props, true);
        this.publicConferenceService = this.getServices().publicConferenceService;
    }
    startLoading = () => { this.setState({ loading: true }) }
    endLoading = () => { this.setState({ loading: false }) }
    sendMessage = () => {
        this.commonAjax(
            this.publicConferenceService.sendChatMessage,
            (e) => { this.setState({ chatBody: "" }); },
            this.showCommonErrorAlert,
            this.state.chatBody, this.props.roomCode
        )
    }
    updateChatBody = (e: ChangeEvent) => {
        this.setState({ chatBody: (e.target as HTMLInputElement).value });
    }
    render() {
        return (
            <form style={{ padding: 5 }} onSubmit={e => { e.preventDefault(); this.sendMessage() }}>

                <div className="input-group">
                    <input required value={this.state.chatBody} className="form-control" name="chatBody" onChange={this.updateChatBody} />
                    <div className="input-group-append">
                        <SubmitButton loading={this.state.loading} />
                    </div>
                </div>

            </form>
        )
    }
}
const SubmitButton = (props: { loading: boolean }) => {

    if (props.loading) {
        return <button className="btn btn-light btn-sm" type="button" disabled>
            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            <span className="sr-only">Loading...</span>
        </button>

    }
    return (
        <button type="submit" className="btn btn-light btn-sm" >
            <i className="fas fa-paper-plane" />
        </button>
    )
}

export default connect(
    mapCommonUserStateToProps
)(ChatForm)