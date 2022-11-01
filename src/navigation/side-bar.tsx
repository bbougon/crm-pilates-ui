import React, { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import type { Location } from "history";
import { NavigateFunction } from "react-router/lib/hooks";
import NavItem from "./nav-item";
import styled from "styled-components";
import { useSelector } from "react-redux";
import { getAuthToken } from "../features/auth";
import { Token } from "../features/domain/token";

const StyledSideNav = styled.div`
  position: fixed;
  height: 100%;
  width: 75px;
  z-index: 1;
  top: 3.4em;
  background-color: #fff;
  overflow-x: hidden;
  padding-top: 10px;
`;

type RouterProps = {
  router: {
    location: Location;
    navigate: NavigateFunction;
    params: any;
  };
};

const SideNav: React.FC<RouterProps> = (props: RouterProps) => {
  const [path, setPath] = useState({
    activePath: props.router.location.pathname,
    items: [
      {
        path: "/",
        name: "Home",
        css: "fa fa-fw fa-home",
        key: 1,
      },
      {
        path: "/clients",
        name: "Clients",
        css: "fa fa-fw fa-user",
        key: 2,
      },
      {
        path: "/calendar",
        name: "Calendar",
        css: "fas fa-calendar-alt",
        key: 3,
      },
    ],
  });

  const onItemClick = (activePath: string) => {
    setPath({ items: path.items, activePath: activePath });
  };

  return (
    <StyledSideNav>
      {path.items.map((item) => {
        return (
          <NavItem
            path={item.path}
            name={item.name}
            css={item.css}
            onItemClick={onItemClick}
            active={item.path === path.activePath}
            key={item.key}
          />
        );
      })}
    </StyledSideNav>
  );
};

export const SideBar = () => {
  const token: Token = useSelector(getAuthToken);
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();

  return token.token && token.token !== "" ? (
    <SideNav router={{ location, navigate, params }} />
  ) : (
    <div />
  );
};
