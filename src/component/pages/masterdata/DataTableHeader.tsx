
import React, { Component, Fragment } from 'react';
import HeaderProps from './../../../models/HeaderProps';
export default class DataTableHeader extends Component<{fieldsFilter:any, orderButtonOnClick(e:any):void, headerProps: HeaderProps[], filterOnChange(e:any):void}, any>
{
    constructor(props) {
        super(props);
    }
    render(){
       
        const props = this.props;
        const headerProps: HeaderProps[] = props.headerProps;
        const fieldsFilter = props.fieldsFilter;
        return (<thead>
            <tr>
                <th>No</th>
                {headerProps.map((headerProp, i) => {
                    const isDate = headerProp.isDate;
                    const headerName = headerProp.value;
                    if (!headerProp.filterable) {
                        return <th key={"dth-"+i+"-"+headerName} >
                            <p>{headerProp.label}</p>
                        </th>
                    }
                    const filterClass = "form-control input-filter";
                    return (
                        <th key={"dth-"+i+"-"+headerName} >
                            <p>{headerProp.label}</p>
                            <div style={{minWidth:'200px'}} className="input-group">
                                {isDate ?
                                    <Fragment>
                                        <input key={"filter-day-"+headerName} autoComplete="off" value={fieldsFilter[headerName+"-day"]??""} onChange={props.filterOnChange} name={headerName + "-day"}
                                            className={filterClass} placeholder={"day"} />
                                        <input key={"filter-month-"+headerName} autoComplete="off" value={fieldsFilter[headerName+"-month"]??""} onChange={props.filterOnChange} name={headerName + "-month"}
                                            className={filterClass} placeholder={"month"} />
                                        <input key={"filter-year-"+headerName} autoComplete="off" value={fieldsFilter[headerName+"-year"]??""} onChange={props.filterOnChange} name={headerName + "-year"}
                                            className={filterClass} placeholder={"year"} />
                                    </Fragment>
                                    :
                                    <input key={"filter-common-"+headerName}  autoComplete="off" value={fieldsFilter[headerName]??""} onChange={props.filterOnChange} placeholder={headerProp.label}
                                        className={filterClass} name={headerName} />
                                }
                            <div className="input-group-append btn-group">
                                <button data-ordertype="asc" onClick={props.orderButtonOnClick} data-orderby={headerName} className="btn btn-outline-secondary btn-sm">
                                    <i data-ordertype="asc" onClick={props.orderButtonOnClick} data-orderby={headerName} className="fas fa-angle-up" /></button>
                                <button data-ordertype="desc" onClick={props.orderButtonOnClick} data-orderby={headerName} className="btn btn-outline-secondary btn-sm">
                                    <i data-ordertype="desc" onClick={props.orderButtonOnClick} data-orderby={headerName} className="fas fa-angle-down" /></button>
                            </div>
                            </div>
                        </th>
                    )
                })}
                <th>Action</th>
            </tr>
        </thead>)
    }
}