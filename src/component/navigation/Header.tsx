
import React, { useRef, Fragment } from 'react';
import BaseComponent from './../BaseComponent';
import { mapCommonUserStateToProps } from './../../constant/stores';
import { withRouter, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { performLogout } from './../../redux/actionCreators';
import { getMenus } from '../../constant/Menus';
import './Header.css';
import User from '../../models/UserModel';
import { baseImageUrl } from './../../constant/Url';
import Menu from './../../models/settings/Menu';
class IState {
    showNavLinks: boolean = false;
}
class Header extends BaseComponent {
    state: IState = new IState();
    buttonToggleNavRef: React.RefObject<HTMLButtonElement> = React.createRef();
    constructor(props: any) {
        super(props, false);
    }
    toggleNavLinks = () => {
        this.setState({ showNavLinks: !this.state.showNavLinks });
    }
    onLogout = (e: any) => {
        const app = this;
        app.showConfirmation("Logout?").then(
            function (ok) {
                if (ok) {
                    app.props.performLogout(app.parentApp);
                }
            }
        )
    }
    setMenu = (menu: Menu) => {
        if (this.state.showNavLinks && this.buttonToggleNavRef.current) {
            this.buttonToggleNavRef.current.click();
        }
        this.props.setMenu(menu);

    }
    render() {
        const showNavLinks: boolean = this.state.showNavLinks;
        const menus = getMenus();
        const user = this.getLoggedUser();
        return (
            <div className="bg-dark container-fluid" style={{ position: 'fixed', zIndex: 55, padding: 0, margin: 0 }}>
                <NavBarTop label={this.getApplicationProfile().name} />
                <nav id="navbar" className="navbar navbar-expand-lg navbar-dark bg-dark" style={{ width: '100%' }}>
                    {/* <div className="container-fluid"></div> */}
                    <a id="navbar-brand" className="navbar-brand" href="#">{this.getApplicationProfile().name}</a>
                    <button ref={this.buttonToggleNavRef} onClick={this.toggleNavLinks} className="navbar-toggler" type="button" data-toggle="collapse"
                        data-target="#navbarToggler" aria-controls="navbarToggler"
                        aria-expanded="false" aria-label="Toggle navigation">
                        <i className={showNavLinks ? "fas fa-times" : "fas fa-bars"} />
                    </button>
                    <div className={"collapse navbar-collapse"} id="navbarToggler">
                        <ul id="navbar-top" className="navbar-nav mr-auto mt-2 mt-lg-0">
                            {menus.map(menu => {
                                if (menu == null || (menu.authenticated && !user)) return null;
                                if (menu.userAuthorized && menu.userAuthorized(user) == false) return null;
                                const isActive = this.props.activeMenuCode == menu.code;
                                return (
                                    <li key={"header-menu-" + new String(menu.code)} className={"nav-item " + (isActive ? "active nav-active" : "nav-inactive")}>
                                        <Link onClick={() => this.setMenu(menu)} className={"nav-link  "}
                                            to={menu.url}><span>{menu.name}</span>
                                        </Link></li>
                                )
                            })}
                        </ul >
                        <form className="form-inline my-2 my-lg-0">
                            <UserIcon setMenuNull={this.props.setMenuNull}
                                onLogout={this.onLogout} user={user} />
                        </form >
                    </div >
                </nav >
            </div>
        )
    }

}
const NavBarTop = (props) => {
    return (
        <div id="navbar-brand-top" style={{ paddingLeft: '0.5rem' }} className="container-fluid">
            <a style={{ fontSize: '15px' }} className="text-white navbar-brand" href="#">
                <strong>{props.label}</strong>
            </a>
        </div>
    );
}
const UserIcon = (props: { user: User | undefined, setMenuNull(): any, onLogout(e): any }) => {
    if (props.user) {
        return (
            <Fragment>
                <Link onClick={props.setMenuNull} style={{ marginRight: "5px" }} className="btn btn-light btn-sm my-2 my-sm-0"
                    to='/settings/user-profile'>
                    <img width="20" src={baseImageUrl() + props.user.profileImage} className="rounded rounded-circle" />
                        &nbsp;{props.user.displayName}
                </Link>
                <a style={{ marginRight: '5px' }} className="btn btn-danger btn-sm  my-2 my-sm-0"
                    onClick={props.onLogout}><i className="fas fa-sign-out-alt"></i>&nbsp;Logout
				</a>
            </Fragment>);
    }
    return (

        <Link style={{ marginRight: '5px' }} onClick={props.setMenuNull} className="btn btn-sm btn-info my-2 my-sm-0"
            to='/login'> <i className="fas fa-sign-in-alt"></i>&nbsp;Login
        </Link>
    );
}

const mapDispatchToProps = (dispatch: Function) => ({
    performLogout: (app: any) => dispatch(performLogout(app))
})


export default withRouter(connect(
    mapCommonUserStateToProps,
    mapDispatchToProps
)(Header))