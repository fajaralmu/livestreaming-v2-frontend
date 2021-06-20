import React, { Component, Fragment } from 'react'
import ConferenceRoomModel from '../../../../../models/ConferenceRoomModel';
import './ChatPanel.css'
import ChatMessageModel from '../../../../../models/ChatMessageModel';
import AnchorWithIcon from '../../../../navigation/AnchorWithIcon';
import ChatForm from './ChatForm';
interface Props {
    room: ConferenceRoomModel;
}
class State {
    showChat: boolean = false;
    unreadCount: number = 0;
}
export default class ChatMessagePanel extends Component<Props, State> {

    state: State = new State();
    chatCount: number = 0;
    readCount: number = 0;

    constructor(props) {
        super(props);
        this.chatCount = this.roomChatCount();

        this.state.unreadCount = this.chatCount;
    }
    roomChatCount = () => this.props.room.chats.length;
    componentDidUpdate() {
        if (this.chatCount < this.roomChatCount() && this.state.unreadCount < this.roomChatCount() && this.state.showChat == false) {
            // console.debug("this.chatCount: ", this.chatCount);
            // console.debug(" this.roomChatCount(): ",  this.roomChatCount());
            // console.debug("this.state.unreadCount: ", this.state.unreadCount);
            this.setState({
                unreadCount: this.roomChatCount() - this.readCount
            })
            this.chatCount = this.roomChatCount();
        }
    }
    getMessages = (): ChatMessageModel[] => this.props.room.chats;
    toggleChat = () => {
        if ((!this.state.showChat) == true) {
            this.setState({ showChat: !this.state.showChat, unreadCount: 0 }, () => {
                this.readCount = this.roomChatCount()
            });
        } else {
            this.setState({ showChat: !this.state.showChat })
        }
    }
    render() {
        const showChat = this.state.showChat;
        return (
            <div className="chat-panel-position">
                <div className="chat-panel bg-success border border-success rounded">
                    {showChat ?
                        <><ChatList chats={this.getMessages()} />
                            <ChatForm roomCode={this.props.room.code} />
                        </> : null
                    }
                    <div onClick={this.toggleChat} className="text-center">
                        <AnchorWithIcon className="btn btn-success" iconClassName={showChat ? "fas fa-angle-down" : "fas fa-angle-up"} onClick={this.toggleChat} >
                            Chat{this.state.unreadCount > 0 ? " (" + this.state.unreadCount + ")" : null}
                        </AnchorWithIcon>
                    </div>
                </div>
            </div>
        )
    }
}


class ChatList extends Component<{ chats: ChatMessageModel[] }, any>{

    lastChatRef: React.RefObject<HTMLDivElement> = React.createRef();
    componentDidMount() {
        this.scrollToLastChat();
    }
    componentDidUpdate() {
        this.scrollToLastChat();
    }
    scrollToLastChat = () => {
        if (this.lastChatRef.current) {
            this.lastChatRef.current.scrollIntoView();
        }
    }
    render() {
        const props = this.props;
        return (
            <div className="chat-list-wrapper bg-white border  border-success">
                <div style={{ padding: 2 }}>
                    {props.chats.map((chat, i) => {
                        return <Fragment key={"chat-" + i}>
                            <div ref={i == props.chats.length - 1 ? this.lastChatRef : null} className="chat-item border rounded bg-light" >
                                <div style={{ width: '100%', fontSize: '0.5em' }} className="text-right  "><strong>{chat.user?.displayName}</strong></div>
                                <span>{chat.date?.toLocaleDateString()}</span>
                                <p  >{chat.body}</p>
                            </div>
                            <p /></Fragment>
                    })}
                </div>
            </div>
        )
    }
}