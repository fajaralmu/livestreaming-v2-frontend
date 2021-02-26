

import React, { Component, Fragment } from 'react';
import { withRouter, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { mapCommonUserStateToProps } from '../../../constant/stores';
import BaseMainMenus from './../../layout/BaseMainMenus';
import MasterDataService from './../../../services/MasterDataService';
import WebResponse from './../../../models/WebResponse';
import Menu from '../../../models/settings/Menu';
import ManagementProperty from '../../../models/ManagementProperty';
import MasterDataManagement from './MasterDataManagement';
import { AuthorityType } from '../../../models/AuthorityType';
import Spinner from './../../loader/Spinner';

interface IState {
    code?: string
    // managementProperties:ManagementProperty[]
}
class MasterDataMain extends BaseMainMenus {
    masterDataService: MasterDataService;
    state: IState = {
        code: undefined
    };
    constructor(props: any) {
        super(props, "Master Data", true);
        this.masterDataService = this.getServices().masterDataService;
        console.debug("PROPS: ", this.props);
    }

    managementPropertiesLoaded = (response: WebResponse) => {
        this.masterDataService.managementProperties = response.generalList ? response.generalList : [];
        this.setSidebarMenus();
        this.refresh();
    }
    setSidebarMenus = () => {
        const sidebarMenus: Menu[] = [];
        const managementProperties: ManagementProperty[] = this.masterDataService.managementProperties;
        for (let i = 0; i < managementProperties.length; i++) {
            const element = managementProperties[i];
            sidebarMenus.push({
                role:[AuthorityType.ROLE_ADMIN],
                name: element.label,
                url: element.entityName,
                code: element.entityName,
                menuClass: element.iconClassName
            });
        }
        console.debug("this.props.setSidebarMenus: ", this.props.setSidebarMenus);
        if (this.props.setSidebarMenus) {
            this.props.setSidebarMenus(sidebarMenus);
        }
    }
    loadManagamenetPages = () => {
        if (this.masterDataService.managementProperties.length > 0) {
            this.setSidebarMenus();
            this.refresh();
            return;
        }
        this.commonAjax(
            this.masterDataService.loadManagementProperties,
            this.managementPropertiesLoaded,
            this.showCommonErrorAlert
        );
    }
    getCode = (): string => {
        return this.props.match.params.code;
    }
    componentDidMount() {
        super.componentDidMount();
        this.loadManagamenetPages();
    }
    componentDidUpdate() {
        this.validateLoginStatus();
        this.setSidebarMenus();
        // console.debug("this.getCode(): ", this.getCode());
        if (this.state.code != this.getCode()) {
            this.setState({ code: this.getCode() });
        }
    }

    render() {
        if (this.getCode() != undefined && this.getCode() != null && this.getCode() != "") {
            return <MasterDataManagement  code={this.getCode()} />
        }
        if (this.masterDataService.managementProperties.length == 0) {
            return <div className="container-fluid  section-body"><Spinner/></div>
        }
        const properties: ManagementProperty[] = this.masterDataService.managementProperties;
        return (
            <div className="container-fluid section-body">
                <h2>Master Data Page</h2>
                <div className="row">
                    {properties.map(property => {

                        return (
                            <div key={"mngmnt-page-item-"+property.entityName} className="col-md-2 text-center" style={{ marginBottom: '10px' }}>
                                <h2 ><Link className="btn btn-warning btn-lg" to={"/management/" + property.entityName} ><i className={property.iconClassName} /></Link></h2>
                                <p>{property.label}</p>
                            </div>
                        )
                    })}
                </div>
            </div>
        )
    }
}
export default withRouter(connect(
    mapCommonUserStateToProps
)(MasterDataMain))