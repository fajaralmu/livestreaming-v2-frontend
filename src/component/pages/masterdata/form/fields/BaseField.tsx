import React from 'react'
import BaseComponent from './../../../../BaseComponent';
import EntityElement from '../../../../../models/settings/EntityElement';

export default class BaseField extends BaseComponent {
    constructor(props) {
        super(props, false);
    }
    componentDidMount() {
        this.prepopulateForm();
    }
    prepopulateForm = () => {

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
}