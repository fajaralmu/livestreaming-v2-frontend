import React, { Component } from 'react'
import Label from '../components/container/Label'
import * as componentUtil from './ComponentUtil'
import InstantTable from './../components/container/InstantTable';
import ComboBoxes from './../components/inputs/ComboBoxes';

export const FilterBox = props => {
    return (
        <div className="filter-box rounded" >
            <InstantTable valign="bottom" rows={props.rows} />
        </div>
    )
}

export const DateSelectionFrom = (props) => {
    console.debug("props.monthVal: ", props.monthVal);
    return (
        <ComboBoxes values={[{
            label: "From Month",
            id: "select-month-from",
            defaultValue: props.monthVal,
            options: componentUtil.getDropdownOptionsMonth(),
            handleOnChange: (e)=>{props.handleOnChangeMfrom(e.target.value)}
        }, {
            label: "Year",
            id: "select-year-from",
            defaultValue: props.yearVal,
            options: componentUtil.getDropdownOptionsYear(props.years[0], props.years[1]),
            handleOnChange: (e)=>{props.handleOnChangeYfrom(e.target.value)}
        }]} />)
}

export const DateSelectionTo = (props) => {
    return (
        <ComboBoxes values={[{
            label: "To Month",
            id: "select-month-to",
            defaultValue: props.monthVal,
            options: componentUtil.getDropdownOptionsMonth(),
            handleOnChange: (e)=>{ props.handleOnChangeMto(e.target.value) }
        }, {
            label: "Year",
            id: "select-year-to",
            defaultValue: props.yearVal,
            options: componentUtil.getDropdownOptionsYear(props.years[0], props.years[1]),
            handleOnChange: (e)=> {props.handleOnChangeYto(e.target.value) }
        }]} />)
}