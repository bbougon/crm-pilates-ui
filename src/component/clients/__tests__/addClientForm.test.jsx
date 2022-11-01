import { render } from "../../../test-utils/test-utils";
import { AddClientForm } from "../ClientForm";
import { fireEvent, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";

describe("Create Client", () => {
  it("Submit should be disabled on loading", () => {
    render(<AddClientForm />);

    userEvent.click(screen.getByRole("button", { name: /add a new client/i }));

    expect(screen.getByRole("button", { name: /submit/i })).toBeDisabled();
  });

  it("Submit should be disabled if only firstname is filled", () => {
    render(<AddClientForm />);

    userEvent.click(screen.getByRole("button", { name: /add a new client/i }));
    userEvent.type(screen.getByText("Client's firstname"), "John");

    expect(screen.getByRole("button", { name: /submit/i })).toBeDisabled();
  });

  it("Submit should be enabled hence firstname and lastname are filled", () => {
    render(<AddClientForm />);

    userEvent.click(screen.getByRole("button", { name: /add a new client/i }));
    userEvent.type(screen.getByText("Client's name"), "Doe");
    userEvent.type(screen.getByText("Client's firstname"), "John");

    expect(screen.getByRole("button", { name: /submit/i })).toBeEnabled();
  });

  it("should provide the ability to add credits", async () => {
    render(<AddClientForm />);
    userEvent.click(screen.getByRole("button", { name: /add a new client/i }));

    userEvent.click(screen.getAllByRole("button")[1]);
    expect(
      screen.getByRole("button", { name: /subject/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/amount of credits/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /add credits/i })
    ).toBeInTheDocument();
    expect(screen.getAllByRole("button")[4]).toBeDisabled();

    fireEvent.mouseDown(screen.getByRole("button", { name: /subject/i }));
    const subject = within(screen.getByRole("listbox"));
    userEvent.click(subject.getByText(/mat/i));
    userEvent.type(screen.getByText(/amount of credits/i), "10");
    userEvent.click(screen.getByRole("button", { name: /add credits/i }));

    expect(screen.getByText("10", { selector: "span" })).toBeInTheDocument();
    expect(screen.getByText(/mat/i, { selector: "p" })).toBeInTheDocument();
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(screen.queryByText(/amount of credits/i)).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /add credits/i })
    ).not.toBeInTheDocument();
    expect(screen.getAllByRole("button")[1]).toBeEnabled();
  });

  it("add credits should be disabled hence all subjects are set", async () => {
    render(<AddClientForm />);
    userEvent.click(screen.getByRole("button", { name: /add a new client/i }));

    userEvent.click(screen.getAllByRole("button")[1]);
    fireEvent.mouseDown(screen.getByRole("button", { name: /subject/i }));
    const mat = within(screen.getByRole("listbox"));
    userEvent.click(mat.getByText(/mat/i));
    userEvent.type(screen.getAllByText(/amount of credits/i)[0], "10");
    userEvent.click(screen.getByRole("button", { name: /add credits/i }));

    userEvent.click(screen.getAllByRole("button")[1]);
    fireEvent.mouseDown(screen.getByRole("button", { name: /subject/i }));
    const machineDuo = within(screen.getByRole("listbox"));
    expect(
      machineDuo.getAllByRole("option").map((item) => item.textContent)
    ).toEqual(["Machine Duo", "Machine Trio", "Machine private"]);
    userEvent.click(machineDuo.getByText(/machine duo/i));
    userEvent.type(screen.getByText(/amount of credits/i), "10");
    userEvent.click(screen.getByRole("button", { name: /add credits/i }));

    userEvent.click(screen.getAllByRole("button")[1]);
    fireEvent.mouseDown(screen.getByRole("button", { name: /subject/i }));
    const machineTrio = within(screen.getByRole("listbox"));
    expect(
      machineTrio.getAllByRole("option").map((item) => item.textContent)
    ).toEqual(["Machine Trio", "Machine private"]);
    userEvent.click(machineTrio.getByText(/machine trio/i));
    userEvent.type(screen.getByText(/amount of credits/i), "10");
    userEvent.click(screen.getByRole("button", { name: /add credits/i }));

    userEvent.click(screen.getAllByRole("button")[1]);
    fireEvent.mouseDown(screen.getByRole("button", { name: /subject/i }));
    const machinePrivate = within(screen.getByRole("listbox"));
    expect(
      machinePrivate.getAllByRole("option").map((item) => item.textContent)
    ).toEqual(["Machine private"]);
    userEvent.click(machinePrivate.getByText(/machine private/i));
    userEvent.type(screen.getByText(/amount of credits/i), "10");
    userEvent.click(screen.getByRole("button", { name: /add credits/i }));

    expect(screen.getAllByRole("button")[1]).toBeDisabled();
  });

  it("should clean all hence submitted", async () => {
    render(<AddClientForm />);
    userEvent.click(screen.getByRole("button", { name: /add a new client/i }));

    userEvent.type(screen.getByText("Client's firstname"), "John");
    userEvent.type(screen.getByText("Client's name"), "Doe");

    userEvent.click(screen.getAllByRole("button")[1]);
    fireEvent.mouseDown(screen.getByRole("button", { name: /subject/i }));
    const mat = within(screen.getByRole("listbox"));
    userEvent.click(mat.getByText(/mat/i));
    userEvent.type(screen.getAllByText(/amount of credits/i)[0], "10");
    userEvent.click(screen.getByRole("button", { name: /add credits/i }));

    userEvent.click(screen.getAllByRole("button")[1]);
    fireEvent.mouseDown(screen.getByRole("button", { name: /subject/i }));
    const subject = within(screen.getByRole("listbox"));
    userEvent.click(subject.getByText(/machine duo/i));
    userEvent.type(screen.getByText(/amount of credits/i), "10");
    userEvent.click(screen.getByRole("button", { name: /add credits/i }));

    userEvent.click(screen.getByRole("button", { name: /submit/i }));

    expect(
      screen.queryByText("10", { selector: "span" })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/mat/i, { selector: "p" })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/machine duo/i, { selector: "p" })
    ).not.toBeInTheDocument();
  });
});
