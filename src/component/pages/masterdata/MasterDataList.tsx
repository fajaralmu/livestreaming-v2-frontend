


import React, { ChangeEvent, Component, Fragment } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { mapCommonUserStateToProps } from './../../../constant/stores';
import BaseComponent from './../../BaseComponent';
import MasterDataService from './../../../services/MasterDataService';
import Modal from '../../container/Modal';
import Filter from './../../../models/Filter';
import EntityProperty from '../../../models/settings/EntityProperty';
import WebRequest from './../../../models/WebRequest';
import WebResponse from './../../../models/WebResponse';
import HeaderProps from './../../../models/HeaderProps';
import './DataTable.css'
import EntityValues from './../../../utils/EntityValues';
import NavigationButtons from './../../navigation/NavigationButtons';
import MasterDataForm from './form/MasterDataForm';
import AnchorButton from '../../navigation/AnchorButton';
import EditDeleteAction from './EditDeleteAction';
import DataTableHeader from './DataTableHeader';
import SimpleError from './../../alert/SimpleError';
import Spinner from './../../loader/Spinner';
import ExternalEditForm from './ExternalEditForm';
import { uniqueId } from './../../../utils/StringUtil';
import ToggleButton from '../../navigation/ToggleButton';
interface IState { recordData?: WebResponse, showForm: boolean, filter: Filter, loading: boolean }
class MasterDataList extends BaseComponent {
    masterDataService: MasterDataService;
    state: IState;
    recordToEdit?: {} = undefined;
    entityProperty: EntityProperty;
    headerProps: HeaderProps[];
    constructor(props: any) {
        super(props, true);
        this.masterDataService = this.getServices().masterDataService;
        this.entityProperty = this.props.entityProperty;
        this.headerProps = EntityProperty.getHeaderLabels(this.props.entityProperty);

        this.state = {
            showForm: false, loading: false,
            filter: { limit: 5, page: 0, fieldsFilter: {} }
        };
    }
    /**
     * remove fieldsfilter empty values";
     */
    adjustFilter = (filter: Filter): Filter => {

        const fieldsFilter = filter.fieldsFilter;
        for (const key in fieldsFilter) {
            const element = fieldsFilter[key];
            if (element == undefined || element == null || new String(element).length == 0) {
                if (filter.fieldsFilter != undefined) {
                    delete filter.fieldsFilter[key];
                }
            }
        }
        return filter;
    }
    loadEntities = (page: number | undefined) => {
        const filter = Object.assign(new Filter(), this.state.filter);
        const entityName = this.entityProperty.entityName;
        filter.page = page ?? filter.page;
        const request: WebRequest = {
            entity: entityName,
            filter: this.adjustFilter(filter)
        }
        this.commonAjax(
            this.masterDataService.loadEntities,
            this.entitiesLoaded,
            this.showCommonErrorAlert,
            request
        );

    }
    entitiesLoaded = (response: WebResponse) => {
        this.setState({ recordData: response, filter: response.filter });
    }
    checkDefaultData = () => {
        if (this.state.loading) {
            return;
        }
        if (this.entityProperty.entityName == this.props.entityProperty.entityName && this.state.recordData != undefined) {
            return;
        }
        this.entityProperty = this.props.entityProperty;
        this.headerProps = EntityProperty.getHeaderLabels(this.props.entityProperty);
        this.loadEntities(0);
    }
    startLoading() { this.setState({ loading: true }) }
    endLoading() { this.setState({ loading: false }) }
    componentDidUpdate() {
        this.validateLoginStatus();
        this.checkDefaultData();
    }
    componentDidMount() {
        this.checkDefaultData();
    }
    getRecordNumber = (i: number): number => {
        let res = (this.state.filter.page ?? 0) * (this.state.filter.limit ?? 5) + i + 1;
        return res;
    }
    filterFormSubmit = (e) => {
        let page = this.state.filter.useExistingFilterPage ? this.state.filter.page : 0;
        this.loadEntities(page);
    }
    filterOnChange = (e: ChangeEvent) => {
        e.preventDefault();
        const input = e.target as any;
        const name = input.name;
        const value = input.value;
        const filter = this.state.filter;
        if (filter.fieldsFilter == undefined) {
            filter.fieldsFilter = {};
        }
        filter.fieldsFilter[name] = value;
        this.setState({ filter: filter });
    }
    setExactSearch = (exacts: boolean) => {
        const filter = this.state.filter;
        filter.exacts = exacts;
        this.setState({ filter: filter });
    }
    filterReset = (e) => {
        const filter = this.state.filter;
        filter.fieldsFilter = {};
        filter.limit = 5;
        this.setState({ filter: filter });
    }
    orderButtonOnClick = (e) => {
        const dataset: DOMStringMap = e.target.dataset;
        const filter = this.state.filter;
        filter.orderBy = dataset['orderby'];
        filter.orderType = dataset['ordertype'];
        this.setState({ filter: filter });
        this.loadEntities(0);
    }
    showEditForm = (response: WebResponse) => {
        if (!response.entities) {
            return;
        }
        this.recordToEdit = response.entities[0];
        this.setState({ showForm: true });
    }
    showCreateForm = (e) => {
        this.recordToEdit = undefined;
        this.setState({ showForm: true });
    }
    updateFilterPage = (page: any) => {
        const filter = this.state.filter;
        filter.useExistingFilterPage = true;
        filter.page = parseInt(page) - 1;
        this.setState({ filter: filter });
    }
    updateFilterLimit = (limit: any) => {
        const filter = this.state.filter;
        filter.limit = parseInt(limit);
        this.setState({ filter: filter });
    }
    getFilter = () => {
        return this.state.filter;
    }
    printRecord = () => {
        this.props.printRecord(this.state.filter);
    }
    render() {
        if (undefined == this.state.recordData) {
            return <Spinner />
        }
        const headerProps: HeaderProps[] = this.headerProps;
        const exactsSearch: boolean = this.state.filter.exacts == true;
        const resultList: any[] = this.state.recordData.entities ? this.state.recordData.entities : [];
        if (headerProps == undefined || resultList == undefined) {
            return <SimpleError />
        }

        if (this.state.showForm == true) {
            return <MasterDataForm recordToEdit={this.recordToEdit} entityProperty={this.entityProperty} onClose={(e) => { this.setState({ showForm: false }) }} />
        }

        return (
            <div id="MasterDataList">
                <div className="btn-group" style={{ marginBottom: '5px' }}>
                    <AnchorButton show={this.entityProperty.creatable == true && this.entityProperty.editable == true} onClick={this.showCreateForm}
                        iconClassName="fas fa-plus">Add Record</AnchorButton>
                    <AnchorButton onClick={this.printRecord} iconClassName="fas fa-file">Print Record</AnchorButton>
                </div>
                <form id="filter-form" onSubmit={(e) => { e.preventDefault() }}>
                    <Modal title="Filter" toggleable={true}>
                        <div>
                            <div className="form-group row">
                                <div className="col-6">
                                    <input value={(this.state.filter.page ?? 0) + 1} onChange={(e) => { this.updateFilterPage(e.target.value) }} min="1" className="form-control" type="number" placeholder="go to page" />
                                </div>
                                <div className="col-6">
                                    <input value={this.state.filter.limit} onChange={(e) => this.updateFilterLimit(e.target.value)} min="1" className="form-control" type="number" placeholder="record per page" />
                                </div>
                                <div className="col-12"><p /></div>
                                <div className="col-3">
                                    <ToggleButton active={exactsSearch}
                                        yesLabel="exact" noLabel="not exact"
                                        onClick={(val: boolean) => this.setExactSearch(val)}
                                    />
                                </div>
                                <div className="col-3">
                                    <SubmitResetButton onSubmit={this.filterFormSubmit} onReset={this.filterReset} />
                                </div>
                            </div>

                        </div>
                    </Modal>
                    <NavigationButtons limit={this.state.filter.limit ?? 5} totalData={this.state.recordData.totalData ?? 0}
                        activePage={this.state.filter.page ?? 0} onClick={this.loadEntities} />
                    <Modal title="Data List" >
                        {this.state.loading ?
                            <Loading loading={this.state.loading} /> : null}
                        <div className="container-fluid" style={{ overflow: 'scroll' }}>
                            <table className="table" >
                                <DataTableHeader fieldsFilter={this.state.filter.fieldsFilter} orderButtonOnClick={this.orderButtonOnClick} filterOnChange={this.filterOnChange} headerProps={headerProps} />
                                <tbody>
                                    {
                                        resultList.map((result, i) => {
                                            const number = this.getRecordNumber(i);
                                            const values: Array<any> = EntityValues.parseValues(result, this.props.entityProperty);
                                            return (<tr key={"tr-result-" + i}>
                                                <td>{number}</td>
                                                {values.map(value => {
                                                    try {
                                                        return (<td key={"td-u-" + uniqueId()}>{value}</td>)
                                                    } catch (error) {
                                                        return (<td key={"td-u-" + uniqueId()}>-</td>)
                                                    }
                                                })}
                                                <td>
                                                    <EditDeleteAction showEditForm={this.showEditForm} record={result} entityProperty={this.entityProperty} reload={() => this.loadEntities(undefined)} />
                                                </td>
                                            </tr>)
                                        })}
                                </tbody>
                            </table>
                        </div>
                    </Modal>
                </form>
            </div >
        )
    }
}
const Loading = ({ loading }) => {
    return (
        <div style={{ width: '100%', height: '100%', paddingTop: '2rem', backgroundColor: 'rgb(240,240,240,0.5)', marginLeft: '-1rem', marginTop: '-1rem', position: 'absolute' }}>
            <Spinner show={loading} />
        </div>
    )
}
const SubmitResetButton = (props: any) => {
    return (<div className="btn-group">
        <button onClick={props.onSubmit} className="btn btn-dark btn-sm"><span className="icon"><i className="fas fa-play-circle" /></span>Apply Filter</button>
        <button onClick={props.onReset} type="reset" className="btn btn-dark btn-sm"><span className="icon"><i className="fas fa-sync-alt" /></span>Reset</button>
    </div>)
}

export default withRouter(connect(
    mapCommonUserStateToProps,
)(MasterDataList))