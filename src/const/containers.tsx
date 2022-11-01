import * as React from "react";
import {ReactElement} from "react";
import styled from "styled-components";
import {DrawProvider} from "../context/DrawerProvider";
import {SnackbarProvider} from "../context/SnackbarProvider";

interface Props {
    className?: string
    children: Element | ReactElement
}

export const Container: React.FC<Props> = ({className, children}: Props) => (
    <SnackbarProvider>
        <DrawProvider>
            <div className={className}>
                <div id="portal"></div>
                {children}
            </div>
        </DrawProvider>
    </SnackbarProvider>
);


export const MainContainer = styled(Container)`
  padding-bottom: 15px ${props => props.theme.paddingBottom};
  padding-left: 80px ${props => props.theme.paddingLeft};
  display: flex ${props => props.theme.display};
  flex: auto ${props => props.theme.flex};
`;