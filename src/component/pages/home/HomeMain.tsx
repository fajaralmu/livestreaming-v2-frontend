

import React from 'react';
import { withRouter, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { mapCommonUserStateToProps } from '../../../constant/stores';
import ApplicationProfileModel from '../../../models/ApplicationProfileModel';
import { baseImageUrl } from '../../../constant/Url';
import './Home.css';
import BasePage from './../../BasePage';
class HomeMain extends BasePage {
    constructor(props: any) {
        super(props, "Home", false);
    }
    render() {
        const applicationProfile: ApplicationProfileModel = this.getApplicationProfile();
        const imageUrl: string = baseImageUrl() + applicationProfile.backgroundUrl;
        return (
            <div className="landing-bg"  style={{
                    backgroundImage: 'url("' + imageUrl + '")',
                    color: applicationProfile.fontColor??"rgb(0,0,0)"
                }} >
                <h1 className="display-4">{applicationProfile.name}</h1>
                <p className="lead">{applicationProfile.shortDescription}</p>
                <hr className="my-4" />
                <p>{applicationProfile.welcomingMessage}</p>
                <div className="btn-group">
                    <Link className="btn btn-primary btn-lg" to="/about" role="button">About Us</Link>
                    <Link className="btn btn-primary btn-lg" to="/login" role="button">Login</Link>
                </div>
            </div>

        )
    }

}

export default withRouter(connect(
    mapCommonUserStateToProps,
)(HomeMain))