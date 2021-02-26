

import React, { Component, Fragment } from 'react';
import { withRouter, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import BaseComponent from '../../BaseComponent';
import { mapCommonUserStateToProps } from '../../../constant/stores';
import ApplicationProfileModel from '../../../models/ApplicationProfileModel';
import { baseImageUrl } from '../../../constant/Url';
import './Home.css';
class HomeMain extends BaseComponent {
    constructor(props: any) {
        super(props, false);
    }

    componentDidMount() {
        document.title = "Home";
    }
    render() {
        const applicationProfile: ApplicationProfileModel = this.getApplicationProfile();
        const imageUrl: string = baseImageUrl() + applicationProfile.backgroundUrl;
        return (
            <div style={{ backgroundColor: applicationProfile.color }} className="text-center container-fluid home-wrapper" >
                <div className=" bg"
                    style={{ backgroundImage: 'url("' + imageUrl + '")', }}
                >   </div>
                <p />
                <Link to="/login" className="btn btn-dark btn-lg">
                    Login to continue
                </Link>
                <p />

                {/* <h1 className="display-4">{applicationProfile.name}</h1>
                    <p className="lead">{applicationProfile.shortDescription}</p>
                    <hr className="my-4" />
                    <p>{applicationProfile.welcomingMessage}</p>
                    <Link className="btn btn-primary btn-lg" to="/about" role="button">About Us</Link> */}
            </div>

        )
    }

}

export default withRouter(connect(
    mapCommonUserStateToProps,
)(HomeMain))