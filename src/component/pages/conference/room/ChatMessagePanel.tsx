import React, { ChangeEvent, Component, Fragment } from 'react'
import ConferenceRoomModel from './../../../../models/ConferenceRoomModel';
import './ChatPanel.css'
import ChatMessageModel from './../../../../models/ChatMessageModel';
import AnchorWithIcon from '../../../navigation/AnchorWithIcon';
import FormGroup from '../../../form/FormGroup';
interface Props {
    room: ConferenceRoomModel;
    sendMessage(body: string): any
}
class State {
    showChat: boolean = false;
    chatBody: string = "";
}
export default class ChatMessagePanel extends Component<Props, State> {

    state: State = new State();
    constructor(props) {
        super(props);
    }
    getMessages = (): ChatMessageModel[] => {

        return this.props.room.chats;
    }
    toggleChat = () => {
        this.setState({ showChat: !this.state.showChat });
    }
    sendMessage = () => {
        this.props.sendMessage(this.state.chatBody);
        this.setState({ chatBody: "" });
    }
    updateChatBody = (e: ChangeEvent) => {
        this.setState({ chatBody: (e.target as HTMLInputElement).value });
    }
    render() {
        const showChat = this.state.showChat;
        return (
            <div style={{ position: 'absolute' }}>
                <div className="chat-panel bg-light border border-dark rounded">
                    {showChat ?
                        <><ChatList chats={this.getMessages()} />
                            <form style={{padding:5}} onSubmit={e => { e.preventDefault(); this.sendMessage() }}>
                                <div className="input-group">
                                    <input value={this.state.chatBody ?? ""} className="form-control" name="chatBody" onChange={this.updateChatBody} />
                                    <div className="input-group-append">
                                        <input type="submit" className="btn btn-dark btn-sm" />
                                    </div>
                                </div>
                            </form>
                        </> : null
                    }
                    <div onClick={this.toggleChat} className="text-center">
                        <AnchorWithIcon className="btn btn-light" iconClassName={showChat ? "fas fa-angle-down" : "fas fa-angle-up"} onClick={this.toggleChat} >Chat</AnchorWithIcon>
                    </div>
                </div>
            </div>
        )
    }
}

const ChatList = (props: { chats: ChatMessageModel[] }) => {

    return (
        <div className="chat-list-wrapper">
            <div style={{padding: 2}}>
                {props.chats.map((chat, i) => { 
                    return <div key={"chat-" + i}>
                        <p>FROM: {chat.user?.displayName}</p>
                        <p>{chat.body}</p>
                        <hr />
                    </div>
                })}
            </div>
        </div>
    )
}