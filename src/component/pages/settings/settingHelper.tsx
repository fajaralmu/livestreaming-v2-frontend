import React, { Fragment } from 'react'
import AnchorButton from '../../navigation/AnchorButton';
export const EditField = ({ edit, name, toggleInput, value, updateProperty, ...props }) => {
    return (edit == true ?
        <PropertyInput updateProperty={updateProperty} name={name} toggleInput={toggleInput} value={value} type={props.type} />
        :
        <PropertyLabel name={name} toggleInput={toggleInput} value={value} type={props.type} />
    )
}
const PropertyInput = ({ name, toggleInput, value, updateProperty, type }) => {
    return (<div className="row">
        <p className="col-md-10"><input type={type ?? 'text'} name={name} onChange={updateProperty} value={value} className="form-control" /></p>
        <div className="col-md-2">
            <AnchorButton attributes={{
                'data-name': name, 'data-enabled': 'false'
            }}
                onClick={toggleInput} className="btn btn-secondary btn-sm">cancel</AnchorButton>
        </div>
    </div>)
}

const PropertyLabel = ({ name, toggleInput, value, type }) => {

    return (<div className="row" >
        <div className="col-md-10">
            <p style={{ backgroundColor: type == 'color' ? value : '#fff' }} >{type == 'color' ? 'Sample Color' : value}</p>
            {type == 'color' ? <p>{value}</p> : null}
        </div>
        <div className="col-md-2">
            <AnchorButton attributes={{
                'data-name': name, 'data-enabled': 'true'
            }} onClick={toggleInput} className=" btn btn-info btn-sm">edit</AnchorButton>
        </div>
    </div>)
}


export const EditImage = ({ name, edit, toggleInput, updateProperty }) => {
    if (edit) {
        return (
            <Fragment>
                <div>
                    <AnchorButton attributes={{
                        'data-name': name, 'data-enabled': 'false'
                    }} onClick={toggleInput} className=" btn btn-secondary btn-sm">cancel</AnchorButton>
                </div>
                <input onChange={updateProperty} className="form control" accept="image/*" type="file" name={name} />
            </Fragment>);
    }
    return (
        <div>
            <AnchorButton attributes={{
                'data-name': name, 'data-enabled': 'true'
            }} onClick={toggleInput} className=" btn btn-info btn-sm">edit image</AnchorButton>
        </div>
    )
}