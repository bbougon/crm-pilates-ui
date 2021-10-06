import styled from "styled-components";
import * as React from "react";

export const Container = ({className, children}) => (
    <div className={className}>
        {children}
    </div>
);


export const MainContainer = styled(Container)`
  padding-bottom: 15px;
  padding-left: 80px;
  display: flex;
  flex: auto;
`;