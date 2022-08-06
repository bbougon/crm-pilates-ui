import React from "react";
import styled from "styled-components";
import NavItem from "./nav-item";
import {useLocation, useNavigate, useParams} from "react-router-dom";

const StyledSideNav = styled.div`
  position: fixed;
  height: 100%;
  width: 75px;
  z-index: 1;
  top: 3.4em;
  background-color: #FFF;
  overflow-x: hidden;
  padding-top: 10px;
`;

class SideNav extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            // eslint-disable-next-line react/prop-types
            activePath: props.router.location.pathname,
            items: [
                {
                    path: '/',
                    name: 'Home',
                    css: 'fa fa-fw fa-home',
                    key: 1
                },
                {
                    path: '/clients',
                    name: 'Clients',
                    css: 'fa fa-fw fa-user',
                    key: 2
                },
                {
                    path: '/calendar',
                    name: 'Calendar',
                    css: 'fas fa-calendar-alt',
                    key: 3
                },
            ]
        }
    }

    onItemClick = (path) => {
        this.setState({ activePath: path }); /* Sets activePath which causes rerender which causes CSS to change */
    };

    render() {
        const { items, activePath } = this.state;
        return(
            <StyledSideNav>
                {
                    items.map((item) => {
                        return (
                            <NavItem
                                path={item.path}
                                name={item.name}
                                css={item.css}
                                onItemClick={this.onItemClick}
                                active={item.path === activePath}
                                key={item.key}/>
                        )
                    })
                }
            </StyledSideNav>);
    }
}

function withRouter(Component) {
    function ComponentWithRouterProp(props) {
        let location = useLocation();
        let navigate = useNavigate();
        let params = useParams();
        return (
            <Component
                {...props}
                router={{ location, navigate, params }}
            />
        );
    }

    return ComponentWithRouterProp;
}

const RouterSideNav = withRouter(SideNav);

export default class SideBar extends React.Component {
    render() {
        return (
            <RouterSideNav/>
        );
    }
}