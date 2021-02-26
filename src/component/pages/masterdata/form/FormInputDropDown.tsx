

import React, { Component, Fragment } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { mapCommonUserStateToProps } from '../../../../constant/stores';
import EntityElement from '../../../../models/settings/EntityElement';
import MasterDataService from '../../../../services/MasterDataService';
import WebResponse from '../../../../models/WebResponse';
import BaseComponent from '../../../BaseComponent'; 
import { uniqueId } from './../../../../utils/StringUtil';
interface IState {
    inputList: any[],
    singlePreviewData?: string, 
}
class FormInputDropDown extends BaseComponent {
    masterDataService: MasterDataService;
    state: IState = {
        inputList: [],
        singlePreviewData: undefined, 
    }
    ref: React.RefObject<any> = React.createRef();
    constructor(props: any) {
        super(props, false);
        this.masterDataService = this.getServices().masterDataService;
    }
    getEntityElement = (): EntityElement => {
        return this.props.entityElement;
    }
    getRequiredAttr = () => {
        const requiredAttr = { required: this.getEntityElement().required == true }
        return (
            // null
            requiredAttr
        )
    }
    inputListLoaded = (response: WebResponse) => {
        if (!response.entities || response.entities.length == 0) {
            throw new Error("Not found");
        }
        this.setState({ inputList: response.entities });
        this.prepopulateForm();
    }
    loadInputList = () => {
        const element = this.getEntityElement();
        const code = element.entityReferenceClass;
        this.commonAjax(
            this.masterDataService.loadAllEntities,
            this.inputListLoaded,
            this.showCommonErrorAlert,
            code
        )
    }

    isNotReady = () => {
        return this.state.inputList.length == 0;
    }
    validateInputType = () => {
        console.debug("validateInputType");
        if (this.isNotReady()) {
            this.loadInputList();
        }
    }
    componentDidUpdate() {
        this.validateInputType();
    }
    componentDidMount() {
        this.validateInputType();
        this.prepopulateForm();
    }

    prepopulateForm = () => {
        if (!this.props.recordToEdit || !this.ref.current) {
            return;

        }
        const fieldName = this.getEntityElement().id;
        let recordValue = this.props.recordToEdit[fieldName];
        if (!recordValue) return;

        let defaultInputValue = undefined;

        if (this.state.inputList.length == 0) {
            return;
        }
        const optionValueName = this.getEntityElement().optionValueName;
        if (!optionValueName) return;
        defaultInputValue = recordValue[optionValueName];

        if (defaultInputValue) {
            this.ref.current.value = defaultInputValue;
        }
    }

    render() {
        
        const element = this.getEntityElement();
        if (this.isNotReady()) {
            return <div className="form-group">Loading...</div>
        }

        const options = this.state.inputList;
        return (<select ref={this.ref} className="form-control" name={element.id} >
            {options.map(option => {
                const optionItemValue = element.optionValueName;
                const optionItemName = element.optionItemName;
                if (!optionItemName || !optionItemValue) { return null; }
                return (
                    <option key={"fid-"+uniqueId()+"-"} value={option[optionItemValue]} >{option[optionItemName]}</option>
                )
            })}
        </select>)
    }

}


export default withRouter(connect(
    mapCommonUserStateToProps,
)(FormInputDropDown))