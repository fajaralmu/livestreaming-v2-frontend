
import { AuthorityType } from '../models/AuthorityType';
import Menu from '../models/settings/Menu';

export const HOME = "home";
export const ABOUT = "about";
export const ACCOUNT = "account";
export const LOGIN = "login";
export const LOGOUT = "logout";
export const DASHBOARD = "dashboard";
export const MENU_SETTING = "settings";
export const MENU_MASTER_DATA = "management";
export const CONFERENCE = "CONFERENCE";
export const CHATROOM = "chatroom";

export const getMenus = () => {
    let menuSet: Menu[] = [];
    for (let i = 0; i < _menus.length; i++) {
        const element: Menu = _menus[i];
        const menu: Menu = Object.assign(new Menu, element);
        const subMenus: Menu[] = [];
        if (element.subMenus) {
            for (let i = 0; i < element.subMenus.length; i++) {
                const subMenu = element.subMenus[i];
                subMenus.push(Object.assign(new Menu, subMenu));
            }
            menu.subMenus = subMenus;
        }
        menuSet.push(menu);
    }

    return menuSet;
}
export const extractMenuPath = (pathName: string) => {
    const pathRaw = pathName.split('/');

    let firstPath = pathRaw[0];
    if (firstPath.trim() == "") {
        firstPath = pathRaw[1];
    }
    return firstPath;
}
export const getMenuByMenuPath = (pathName: string): Menu | null => {
    const menus = getMenus();
    try {
        for (let i = 0; i < menus.length; i++) {
            const menu: Menu = menus[i];
            if (menu.url == "/" + pathName) {
                return menu;
            }
        }
        return null;
    } catch (error) {
        return null;
    }
}

const _menus: Menu[] = [
    {
        code: HOME,
        name: "Home",
        url: "/home",
        menuClass: "fa fa-home",
        active: false,
        authenticated: false,
        showSidebar: false,
        role: []
    },

    {
        code: DASHBOARD,
        name: "Dashboard",
        url: "/dashboard",
        menuClass: "fas fa-tachometer-alt",
        active: false,
        authenticated: true,
        showSidebar: true,
        role: [AuthorityType.ROLE_ADMIN, AuthorityType.ROLE_USER],
        subMenus: []
    }, {
        code: CONFERENCE,
        name: "Conference",
        url: "/conference",
        menuClass: "fas fa-video",
        active: false,
        authenticated: true,
        showSidebar: true,
        role: [AuthorityType.ROLE_ADMIN, AuthorityType.ROLE_USER],
        subMenus: [
            {
                code: 'conf_main',
                name: 'My Conference',
                url: 'main',
                menuClass: 'fas fa-list-alt',
                role: [AuthorityType.ROLE_ADMIN, AuthorityType.ROLE_USER],
            },
            {
                code: 'conf_content',
                name: 'Streaming',
                url: 'room',
                menuClass: 'fas fa-user-friends',
                role: [AuthorityType.ROLE_ADMIN, AuthorityType.ROLE_USER],
            },
        ]
    },

    {
        code: MENU_MASTER_DATA,
        name: "Master Data",
        url: "/management",
        menuClass: "fa fa-database",
        active: false,
        authenticated: true,
        showSidebar: true,
        role: [AuthorityType.ROLE_ADMIN],
    },
    {
        code: MENU_SETTING,
        name: "Setting",
        url: "/settings",
        menuClass: "fas fa-cogs",
        active: false,
        authenticated: true,
        showSidebar: true,
        role: [AuthorityType.ROLE_ADMIN, AuthorityType.ROLE_USER],
        subMenus: [
            {
                code: 'user_profile',
                name: 'Profile',
                menuClass: 'fas fa-user-cog',
                url: 'user-profile',
                role: [AuthorityType.ROLE_ADMIN, AuthorityType.ROLE_USER],
            },
            {
                code: 'app_profile',
                name: 'Application Setting',
                menuClass: 'fas fa-cog',
                url: 'app-profile',
                role: [AuthorityType.ROLE_ADMIN],
            },

        ]
    },
];
