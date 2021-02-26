import React, { Component } from 'react'
import { FieldType } from '../../../../../models/FieldType';
import { getInputReadableDate } from '../../../../../utils/DateUtil';
import BaseField from './BaseField';

export default class FormInputCommon extends BaseField {
    ref: React.RefObject<any> = React.createRef();
    constructor(props) {
        super(props);
    }

    prepopulateForm = () => {
        if (!this.props.recordToEdit || !this.ref.current) {
            return;

        }
        const element = this.getEntityElement();
        const fieldName = element.id;
        let recordValue = this.props.recordToEdit[fieldName];
        if (undefined == recordValue){
            console.debug(fieldName, " is undefined", this.props.recordToEdit, this.props.recordToEdit[fieldName]);
            return;
        }

        const fieldType: FieldType = element.fieldType;
        let defaultInputValue: any = undefined;
        switch (fieldType) {
            case FieldType.FIELD_TYPE_DATE:
                const dateObj = new Date(recordValue);
                if (!dateObj) { break }
                defaultInputValue = getInputReadableDate(dateObj);
                break;
            case FieldType.FIELD_TYPE_NUMBER:
                defaultInputValue = new String(recordValue);
                break;
            default:
                defaultInputValue = recordValue;
                break;
        }
        if (defaultInputValue) {

            if (element.optionItemName && element.optionItemName != "") {
                const valueAsObj = defaultInputValue;
                this.ref.current.value = valueAsObj[element.optionItemName ?? "id"];
            } else {
                this.ref.current.value = defaultInputValue;
            }
        }
    }
    render() {
        const element = this.getEntityElement();
        const requiredAttr = this.getRequiredAttr();
        if (element.identity == true || element.editable == false) {
            return (<input {...requiredAttr} value="Generated" ref={this.ref} className="form-control" name={element.id} disabled />
            )
        }
        let input = <p>{element.fieldType}</p>;
        switch (element.fieldType) {
            case FieldType.FIELD_TYPE_PLAIN_LIST:
                input = (
                    <select  {...requiredAttr} ref={this.ref} className="form-control" name={element.id} >
                        {element.plainListValues.map((value, i) => {
                            return (
                                <option key={"s-" + element.id + '-o-' + i} value={value}>{value}</option>
                            )
                        })}
                    </select>
                )
                break;
            case FieldType.FIELD_TYPE_TEXTAREA:
                input = <textarea {...requiredAttr} ref={this.ref} className="form-control" name={element.id} />
                break;
            default:
                input = <input type={element.type} {...requiredAttr} ref={this.ref} className="form-control" name={element.id} />

        }
        return input;

    }
}