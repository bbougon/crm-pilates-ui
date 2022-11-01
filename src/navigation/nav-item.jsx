import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";

class NavItem extends React.Component {
  handleClick = () => {
    // eslint-disable-next-line react/prop-types
    const { path, onItemClick } = this.props;
    onItemClick(path);
  };

  render() {
    // eslint-disable-next-line react/prop-types
    const { active, path, css } = this.props;

    const NavIcon = styled.div``;

    const StyledNavItem = styled.div`
      height: 70px;
      width: 75px;
      text-align: center;
      margin-bottom: 0;
      a {
        font-size: 2.7em;
        color: ${(props) => (props.active ? "#CCC" : "#999")};
        :hover {
          opacity: 0.7;
          text-decoration: none; /* Gets rid of underlining of icons */
        }
      }
    `;

    return (
      <StyledNavItem active={active}>
        {/* eslint-disable-next-line react/prop-types */}
        <Link to={path} className={css} onClick={this.handleClick}>
          <NavIcon />
        </Link>
      </StyledNavItem>
    );
  }
}

export default NavItem;
