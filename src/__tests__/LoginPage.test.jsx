import React from "react";
import {screen, waitFor} from '@testing-library/react';
import {render} from "../test-utils/test-utils";
import App from '../App';
import {describe, it} from 'vitest'
import userEvent from "@testing-library/user-event";

describe('App', () => {

    it('should display login page if not authenticated', () => {
        render(<App/>);

        expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    });

    it('should display login page when trying to reach client page if not authenticated', () => {
        render(<App/>);

        userEvent.click(screen.getAllByRole("link")[3])

        expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
        expect(screen.queryByText(/add a new client/i)).not.toBeInTheDocument()
    });

    it('should display login page when trying to reach calendar page if not authenticated', () => {
        render(<App/>);

        userEvent.click(screen.getAllByRole("link")[4])

        expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
        expect(screen.queryByText(/next/i)).not.toBeInTheDocument()
    });

})
