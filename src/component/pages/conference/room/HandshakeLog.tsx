import React, { Component } from 'react'
import { uniqueId } from './../../../../utils/StringUtil';
import AnchorWithIcon from './../../../navigation/AnchorWithIcon';
class State {
    logs: string[] = [];
}
interface Props {
    show:boolean
 }
export default class HandshakeLog extends Component<Props, State>{
    state: State = new State();
    id: string = uniqueId();
    enabled:boolean = false;
    constructor(props) {
        super(props);
    }
    clearLog = () => {
        this.setState({ logs: [] })
    }
    setLogEnabled = (val:boolean) => {
        this.enabled = val;
        if (!val) {
            this.clearLog();
        }
    }
    addLog = (log: string) => {
        const logs = this.state.logs;
        if (this.enabled) {
            logs.push(log);
            this.setState({ logs: logs });
        }
    }
    getMappedLog = () => {
        const logs: string[] = this.state.logs;
        const mappedLogs: Map<string, number> = new Map();
        const result: string[] = new Array();
        let index = 0;
        for (let i = 0; i < logs.length; i++) {
            let log = logs[i];
            const existLogCount = mappedLogs.get(index + "-" + log);
            if (existLogCount) {
                mappedLogs.set(index + "-" + log, existLogCount + 1);
            } else {
                index++;
                mappedLogs.set(index + "-" + log, 1);
            }
        }

        mappedLogs.forEach((count, log) => {
            if (count == 1) {
                result.push(log);
            } else {
                result.push(log + " (" + count + ")");
            }
        })

        return result;
    }
    render() {
        if (this.props.show == false) return <></>
        const mappedLog: string[] = this.getMappedLog();
        return (
            <ul className="text-left" style={{ listStyleType: 'none', fontSize: '0.7em' }}>
                <li><AnchorWithIcon className="btn btn-light btn-sm" iconClassName="fas fa-trash" onClick={this.clearLog} >Clear Log</AnchorWithIcon>
                </li>
                {mappedLog.map((log, i) => {
                    return <li key={"log-" + i + "-" + this.id}>
                        <code className="text-dark" >{log}</code>
                    </li>
                })}
            </ul>
        )
    }

}