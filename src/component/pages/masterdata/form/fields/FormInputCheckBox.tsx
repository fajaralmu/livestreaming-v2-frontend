import React, { Component, Fragment }  from 'react';
import EntityElement from '../../../../../models/settings/EntityElement';
import BaseField from './BaseField';


export default class FormInputCheckbox extends BaseField {
    state = {
        checked: false
    }
    constructor(props) {
        super(props);
    }
    prepopulateForm = () => {
         
        if (!this.props.recordToEdit) {
            return;
        }
        const fieldName = this.getEntityElement().id;
        let recordValue = this.props.recordToEdit[fieldName];
        
        if (!recordValue) return;
        
        this.setState({ checked: recordValue == true })
    }
    render() {
        const element: EntityElement = this.getEntityElement();
        const checked: boolean = this.state.checked;
        return (
            <Fragment>
                <input type="hidden" name={element.id} value={checked ? 'true' : 'false'} />
                <div className="btn-group">
                    <a className={checked?"btn btn-dark":"btn btn-light"} onClick={(e) => this.setState({ checked: true })} >Yes</a>
                    <a className={!checked?"btn btn-dark":"btn btn-light"} onClick={(e) => this.setState({ checked: false })} >No</a>
                </div>
            </Fragment>
        )
    }

}
