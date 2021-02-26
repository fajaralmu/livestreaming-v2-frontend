

import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { mapCommonUserStateToProps } from '../../../../constant/stores';
import EntityElement from '../../../../models/settings/EntityElement';
import { FieldType } from '../../../../models/FieldType';
import FormInputImage from './fields/FormInputImage';
import FormInputImageMultiple from './fields/FormInputImageMultiple';
import BaseComponent from './../../../BaseComponent';
import FormInputDropDown from './fields/FormInputDropDown';
import FormInputTextEditor from './fields/FormInputTextEditor';
import FormInputCheckbox from './fields/FormInputCheckBox';
import FormInputCommon from './fields/FormInputCoomon';
import FormInputDropDownDynamic from './fields/FormInputDropDownDynamic';
import FormGroup from './../../../form/FormGroup';

class FormInputField extends BaseComponent {

    constructor(props: any) {
        super(props, false);
    }
    getEntityElement = (): EntityElement => {
        return this.props.entityElement;
    }
    render() {
        const element = this.getEntityElement();

        let input:JSX.Element  = <p>{element.fieldType}</p>;
        switch (element.fieldType) {
            case FieldType.FIELD_TYPE_DYNAMIC_LIST:
                input = <FormInputDropDownDynamic recordToEdit={this.props.recordToEdit} entityElement={element} />
                break;
            case FieldType.FIELD_TYPE_FIXED_LIST:
                input = <FormInputDropDown recordToEdit={this.props.recordToEdit} entityElement={element} />
                break;
            case FieldType.FIELD_TYPE_TEXTEDITOR:
                input = <FormInputTextEditor recordToEdit={this.props.recordToEdit} entityElement={element} />
                break;

            case FieldType.FIELD_TYPE_IMAGE:
                input = element.multiple ?
                    <FormInputImageMultiple recordToEdit={this.props.recordToEdit} entityElement={element} />
                    :
                    <FormInputImage recordToEdit={this.props.recordToEdit} entityElement={element} />
                break;
            case FieldType.FIELD_TYPE_CHECKBOX:
                input = <FormInputCheckbox recordToEdit={this.props.recordToEdit} entityElement={element} />
                break;
            case FieldType.FIELD_TYPE_PLAIN_LIST:
            case FieldType.FIELD_TYPE_TEXTAREA:
            default:
                input = <FormInputCommon recordToEdit={this.props.recordToEdit} entityElement={element} />
        }
        const formLabel = <span>{element.labelName} 
        {element.editable && element.required?<i className="text-danger">*</i>:null}</span>
       return  <FormGroup orientation='vertical' label={formLabel}>
                { input}
            </FormGroup>
    }

}

export default withRouter(connect(
    mapCommonUserStateToProps,
)(FormInputField))