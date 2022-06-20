import * as React from "react";
import styled from "styled-components";
import {ReactElement} from "react";

interface Props {
    className?: string
    children: Element | ReactElement
}

export const Container:React.FC <Props> = ({className, children}: Props) => (
    <div className={className}>
        {children}
    </div>
);


export const MainContainer = styled(Container)`
  padding-bottom: 15px ${props => props.theme.paddingBottom};
  padding-left: 80px ${props => props.theme.paddingLeft};
  display: flex ${props => props.theme.display};
  flex: auto ${props => props.theme.flex};
`;