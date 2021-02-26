
import React, { Fragment, Component } from 'react';
import { toBase64v2 } from '../../../../../utils/ComponentUtil';
import AnchorButton from '../../../../navigation/AnchorButton';
import EntityElement from '../../../../../models/settings/EntityElement';
import { baseImageUrl } from '../../../../../constant/Url'; 
import { withRouter, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { mapCommonUserStateToProps } from '../../../../../constant/stores';
import BaseField from './BaseField';
interface IState {
    previewData: Map<number, string>,
    inputElements: number[]
}
class FormInputImageMultiple extends BaseField {
    state: IState = {
        previewData: new Map(),
        inputElements: [1]
    }
    ref: React.RefObject<any> = React.createRef();
    constructor(props: any) {
        super(props);
    }
    setImageData = (e, index) => {
        const app = this;
        toBase64v2(e.target).then(function (data) {
            const previewData = app.state.previewData;
            previewData.set(index, data);
            app.setState({ previewData: previewData });
        })
    }

    addInputElement = (e) => {
        const element = this.state.inputElements;
        if (element.length == 0) {
            element.push(1);
        } else {
            element.push(element[element.length - 1] + 1);
        }
        this.setState({ inputElements: element });
    }
    removeInputElement = (removedIndex: number) => {
        const app = this;
        this.showConfirmationDanger("Delete image?")
            .then(function (ok) {
                if (ok) {
                    app.doRemoveInputElement(removedIndex);
                }
            })
    }

    doRemoveInputElement = (removedIndex: number) => {
        const previewData = this.state.previewData;
        const element = this.state.inputElements;
        for (let i = 0; i < element.length; i++) {
            const index = element[i];
            if (index == removedIndex) {
                element.splice(i, 1);
                previewData.delete(removedIndex);
            }
        }
        this.setState({ inputElements: element, previewData: previewData });
    }
      
    prepopulateForm = () => {
        if (!this.props.recordToEdit) {
            return;
        }
        let defaultValue = this.props.recordToEdit[this.getEntityElement().id];
        if (!defaultValue || new String(defaultValue).trim() == "") {
            return;
        }
        const previewData: Map<number, string> = this.state.previewData;
        const imageNames: string[] = new String(defaultValue).split("~");
        const inputElements: number[] = new Array<number>();
        for (let i = 0; i < imageNames.length; i++) {
            const imageName: string = imageNames[i];
            previewData.set(i, imageName);
            inputElements.push(i);
        }
        this.setState({ previewData: previewData, inputElements: inputElements });
    }
    render() {
        const element: EntityElement = this.getEntityElement();

        return (
            <React.Fragment>
                {this.state.inputElements.map(index => {
                    const previewData: string | undefined = this.state.previewData.get(index);
                    const isNull = previewData == undefined || new String(previewData).trim() == "";
                    const isBase64 = !isNull && isBase64Image(previewData);
                    return (
                        <Fragment key={"IMG"+index+element.id}>
                            {isNull ?
                                <input onChange={(e) => this.setImageData(e, index)} type="file" accept="image/*"
                                    name={element.id} className='form-control' /> : null}
                            {isBase64 ?
                                <div>
                                    <input value={previewData} type="hidden" name={element.id} />
                                    <ImagePreview imageData={previewData} />
                                </div>
                                :
                                !isNull ?
                                    <div>
                                        <input value={previewData} type="hidden" name={element.id} className='form-control' />
                                        <ImagePreview imageData={baseImageUrl() + previewData} />
                                        <p className="badge badge-warning">{previewData}</p>
                                    </div> :
                                    null
                            }
                            <AnchorButton show={this.state.previewData != undefined}
                                onClick={(e: any) => this.removeInputElement(index)} iconClassName="fas fa-times" className="btn btn-danger btn-sm">
                                remove {index}
                            </AnchorButton>
                        </Fragment>)
                })}
                <p></p>
                <AnchorButton iconClassName="fas fa-plus" onClick={this.addInputElement}>Add</AnchorButton>
            </React.Fragment>
        )
    }

}
const isBase64Image = (string?: string) => {
    return string && string.startsWith("data:image");
}
const ImagePreview = (props) => {
    if (props.show == false || !props.imageData) return null;
    return <img className="image" style={{ margin: '3px' }} src={props.imageData} width="50" height="50" />
}
export default withRouter(connect(
    mapCommonUserStateToProps,
)(FormInputImageMultiple))
