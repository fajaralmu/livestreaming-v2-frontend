import React, { Fragment } from 'react';
import BaseComponent from './../BaseComponent';
import { mapCommonUserStateToProps } from './../../constant/stores';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { performLogout } from './../../redux/actionCreators';
import Header from '../navigation/Header';
import ApplicationContent from './ApplicationContent';
import SideBar from '../navigation/SideBar';
import './Layout.css';
import Menu from '../../models/settings/Menu';
import { getMenuByMenuPath, extractMenuPath } from './../../constant/Menus';
interface IState {
    showSidebar: boolean;
    activeMenuCode: any;
    menu?: Menu;
    sidebarMenus?: Menu[]
};
class MainLayout extends BaseComponent {
    state: IState = {
        showSidebar: false,
        activeMenuCode: null,
        menu: undefined,
        sidebarMenus: []
    };
    currentPathName: string = "";
    constructor(props: any) {
        super(props, false);
        this.state = {
            ...this.state,
        }
    }
    setMenuNull = () => {
        console.warn("SET MENU NULL");
        this.setState({ menu: undefined, showSidebar: false, activeMenuCode: null, sidebarMenus: null });
    }
    setMenu = (menu: Menu) => {
        if (menu == null) {
            return;
        }
        console.debug("SET MENU: ", menu.code);
        this.setState({ menu: menu, sidebarMenus: null, showSidebar: menu.showSidebar, activeMenuCode: menu.code });
    }
    setSidebarMenus = (menus: Menu[]) => {
        // console.debug("Set sidebar menus: ", menus);
        this.setState({ sidebarMenus: menus });
    }
    componentDidMount() {
        this.setCurrentMenu();
    }
    componentDidUpdate() {
        this.setCurrentMenu();
    }
    setCurrentMenu = () => {
        const pathName = extractMenuPath(this.props.location.pathname);

        if (pathName == this.currentPathName) {
            return;
        }
        this.currentPathName = pathName;
        const menu = getMenuByMenuPath(pathName);
        if (menu == null) {
            this.setMenuNull();
        } else {
            this.setMenu(menu);
        }
    }
    getSubMenus = () :Menu[]|null => {
        const menuState:Menu|undefined = this.state.menu;
        if (menuState && menuState.subMenus != null && menuState.subMenus?.length > 0) {
            return menuState.subMenus;
        }
        if (this.state.sidebarMenus) {
            return this.state.sidebarMenus;
        }
        return null;
    }
    render() {
        const showSidebar: boolean = this.state.showSidebar == true;
        const className = showSidebar ? "app-content" : "content";
        return (
            <Fragment>
                <Header setMenuNull={this.setMenuNull} activeMenuCode={this.state.activeMenuCode} setMenu={this.setMenu} />
                <div id="content-wrapper" className={"container-fluid  " + className}>
                    <ApplicationContent setSidebarMenus={this.setSidebarMenus} />
                </div>
                {showSidebar ?
                    <SideBar sidebarMenus={this.getSubMenus()} parentMenu={this.state.menu} />
                    : null}
            </Fragment>
        )
    }

}
const mapDispatchToProps = (dispatch: Function) => ({
    performLogout: (app: any) => dispatch(performLogout(app))
})


export default withRouter(connect(
    mapCommonUserStateToProps,
    mapDispatchToProps
)(MainLayout))