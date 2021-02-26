
import React, { Fragment, Component } from 'react';
import { toBase64v2 } from '../../../../utils/ComponentUtil';
import AnchorButton from '../../../navigation/AnchorButton';
import EntityElement from '../../../../models/settings/EntityElement';
import { baseImageUrl } from '../../../../constant/Url';
import BaseComponent from '../../../BaseComponent';
import { withRouter, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { mapCommonUserStateToProps } from './../../../../constant/stores';
interface IState {
    singlePreviewData?: string,
    showInputFile: boolean
}
  class FormInputImage extends BaseComponent {
    state: IState = {
        singlePreviewData: undefined,
        showInputFile: false
    }
    ref: React.RefObject<any> = React.createRef();
    constructor(props: any) {
        super(props, false);
    }
    changeSingleImageData = (e) => {
        const app = this;
        toBase64v2(e.target).then(function (data) {
            app.setState({ singlePreviewData: data });
        })
    }
    removeImage = (e) => {
        const app = this;
        this.showConfirmationDanger("Remove image?")
            .then(function (ok) {
                if (ok) {
                    app.doRemoveImage();
                }
            })
    }

    doRemoveImage = () => {
        if (this.ref.current) {
            this.ref.current.value = null;
        }
        this.setState({ singlePreviewData: undefined, showInputFile: false });
    }

    getEntityElement(): EntityElement {
        return this.props.element;
    }
    componentDidMount() {
        this.prepopulateForm();
    }
    prepopulateForm() {
        if (!this.props.recordToEdit){ 
            return;
        }
        let defaultValue = this.props.recordToEdit[this.getEntityElement().id];
        if (!defaultValue){ 
            return;
        }
        const fullUrl = baseImageUrl() + defaultValue;
        this.setState({ singlePreviewData: fullUrl, showInputFile:true });
    }
    render() {
        const element: EntityElement = this.getEntityElement();
        return (
            <React.Fragment>
                {this.state.showInputFile ?
                    <input ref={this.ref}
                        onChange={this.changeSingleImageData} type="file" accept="image/*" name={element.id} className='form-control' />

                    :
                    <Fragment>
                        <p></p>
                        <AnchorButton onClick={(e)=> this.setState({showInputFile:true})} iconClassName="fas fa-plus" className="btn btn-info btn-sm">Add Image</AnchorButton>
                        <input type="hidden" name={element.id} value="NULLED" />
                    </Fragment>
                }
                <ImagePreview imageData={this.state.singlePreviewData} />
                <AnchorButton show={this.state.singlePreviewData != undefined} onClick={this.removeImage} iconClassName="fas fa-times" className="btn btn-danger btn-sm">remove</AnchorButton>
            </React.Fragment>
        )
    }

}
const ImagePreview = (props) => {
    if (props.show == false || !props.imageData) return null;
    return <img className="image" style={{ margin: '3px' }} src={props.imageData} width="50" height="50" />
}
export default withRouter(connect(
    mapCommonUserStateToProps,
)(FormInputImage))