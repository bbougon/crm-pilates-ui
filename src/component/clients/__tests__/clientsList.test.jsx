import React from "react";
import { afterAll, afterEach, beforeEach, describe, it } from "vitest";
import { Clients } from "../ClientPage";
import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render } from "../../../test-utils/test-utils";
import {
  ApiClientBuilder,
  ClientsBuilder,
} from "../../../test-utils/clients/clients";
import {
  RequestHandlerBuilders,
  ServerBuilder,
} from "../../../test-utils/server/server";

describe("ClientList page", function () {
  const clients = new ClientsBuilder()
    .withClient(
      new ApiClientBuilder().withFirstname("John").withLastname("Doe").build()
    )
    .withClient(
      new ApiClientBuilder()
        .withFirstname("Pierre")
        .withLastname("Martin")
        .withId("1")
        .withCredits([
          { value: 2, subject: "MAT" },
          {
            value: 5,
            subject: "MACHINE_DUO",
          },
        ])
        .build()
    )
    .withClient(
      new ApiClientBuilder()
        .withFirstname("Henri")
        .withLastname("Verneuil")
        .withId("2")
        .build()
    )
    .withClient(
      new ApiClientBuilder()
        .withFirstname("Bertholt")
        .withLastname("Brecht")
        .withId("3")
        .withCredits([
          { value: 2, subject: "MAT" },
          {
            value: 5,
            subject: "MACHINE_DUO",
          },
          { value: 5, subject: "MACHINE_TRIO" },
          { value: 5, subject: "MACHINE_PRIVATE" },
        ])
        .build()
    )
    .build();
  const server = new ServerBuilder().serve(
    new RequestHandlerBuilders().get("/clients").ok().body(clients).build()
  );

  beforeEach(() => server.listen());

  afterEach(() => server.resetHandlers());

  afterAll(() => server.close());

  describe("fetches clients when loading", function () {
    describe("retrieve them", () => {
      it("and should display them", async () => {
        render(<Clients />);

        expect(
          await screen.findByText("Doe", { selector: "h6" })
        ).toBeInTheDocument();
        expect(screen.getByText("John")).toBeInTheDocument();
        expect(
          screen.getByText("Martin", { selector: "h6" })
        ).toBeInTheDocument();
        expect(screen.getByText("Pierre")).toBeInTheDocument();
        expect(
          screen.getByText("Verneuil", { selector: "h6" })
        ).toBeInTheDocument();
        expect(screen.getByText("Henri")).toBeInTheDocument();
      });

      describe("interacting with them", () => {
        it("should display credits when clicking on name", async () => {
          render(<Clients />);

          userEvent.click(
            await screen.findByRole("button", { name: /martin/i })
          );

          const clientDetails = screen.getByRole("region");
          expect(
            within(clientDetails).getByText("2", { selector: "span" })
          ).toBeInTheDocument();
          expect(
            within(clientDetails).getByText(/mat/i, { selector: "p" })
          ).toBeInTheDocument();
          expect(
            within(clientDetails).getByText("5", { selector: "span" })
          ).toBeInTheDocument();
          expect(
            within(clientDetails).getByText(/machine duo/i, { selector: "p" })
          ).toBeInTheDocument();
        });

        it("should add credits to existing credits", async () => {
          const clients = new ClientsBuilder()
            .withClient(
              new ApiClientBuilder()
                .withFirstname("Pierre")
                .withLastname("Martin")
                .withId("1")
                .withCredits([
                  { value: 2, subject: "MAT" },
                  {
                    value: 5,
                    subject: "MACHINE_DUO",
                  },
                ])
                .build()
            )
            .build();
          server.resetHandlers(
            new RequestHandlerBuilders()
              .get("/clients")
              .ok()
              .body(clients)
              .build(),
            new RequestHandlerBuilders()
              .post("/clients/1/credits")
              .ok()
              .body([
                {
                  value: 10,
                  subject: "MAT",
                },
              ])
              .build()
          );
          render(<Clients />);

          userEvent.click(
            await screen.findByRole("button", { name: /martin/i })
          );
          const clientDetails = screen.getByRole("region");
          expect(
            within(clientDetails).getAllByRole("button", {
              name: /add credits/i,
            })[0]
          ).toBeDisabled();
          userEvent.type(
            within(clientDetails).getAllByText(/amount of credits/i)[0],
            "10"
          );
          userEvent.click(
            within(clientDetails).getAllByRole("button", {
              name: /add credits/i,
            })[0]
          );

          await waitFor(() =>
            expect(
              within(screen.getByRole("region")).getAllByLabelText(
                /amount of credits/i,
                { selector: "input" }
              )[0]
            ).toHaveValue(null)
          );
          expect(
            await within(clientDetails).findByText("12")
          ).toBeInTheDocument();
        });

        it("should add a form to add credits when clicking on `+`", async () => {
          const clients = new ClientsBuilder()
            .withClient(
              new ApiClientBuilder()
                .withFirstname("Pierre")
                .withLastname("Martin")
                .withId("1")
                .withCredits([
                  { value: 2, subject: "MAT" },
                  {
                    value: 5,
                    subject: "MACHINE_DUO",
                  },
                ])
                .build()
            )
            .build();
          server.resetHandlers(
            new RequestHandlerBuilders()
              .get("/clients")
              .ok()
              .body(clients)
              .build(),
            new RequestHandlerBuilders()
              .post("/clients/1/credits")
              .ok()
              .body([
                {
                  value: 10,
                  subject: "MACHINE_TRIO",
                },
              ])
              .build()
          );
          render(<Clients />);

          userEvent.click(
            await screen.findByRole("button", { name: /martin/i })
          );
          const clientDetails = screen.getByRole("region");
          userEvent.click(within(clientDetails).getAllByRole("button")[2]);

          expect(
            screen.getByRole("button", { name: /subject/i })
          ).toBeInTheDocument();

          fireEvent.mouseDown(screen.getByRole("button", { name: /subject/i }));
          const subject = within(screen.getByRole("listbox"));
          expect(subject.getByText(/machine trio/i)).toBeInTheDocument();
          expect(subject.getByText(/machine private/i)).toBeInTheDocument();
          expect(subject.queryByText(/mat/i)).not.toBeInTheDocument();
          expect(subject.queryByText(/machine duo/i)).not.toBeInTheDocument();

          userEvent.click(subject.getByText(/machine trio/i));
          userEvent.type(
            within(clientDetails).getAllByText(/amount of credits/i)[2],
            "10"
          );
          userEvent.click(
            within(clientDetails).getAllByRole("button", {
              name: /add credits/i,
            })[2]
          );

          expect(
            await within(clientDetails).findByText("2")
          ).toBeInTheDocument();
          expect(
            await within(clientDetails).findByText(/mat/i)
          ).toBeInTheDocument();
          expect(
            await within(clientDetails).findByText("5")
          ).toBeInTheDocument();
          expect(
            await within(clientDetails).findByText(/machine duo/i)
          ).toBeInTheDocument();
          expect(
            await within(clientDetails).findByText("10")
          ).toBeInTheDocument();

          expect(
            screen.queryByRole("button", { name: /subject/i })
          ).not.toBeInTheDocument();
        });

        it("should disabled add form button if no more subjects available for client", async () => {
          render(<Clients />);

          userEvent.click(
            await screen.findByRole("button", { name: /brecht/i })
          );
          const clientDetails = screen.getByRole("region");

          expect(
            within(clientDetails).getAllByRole("button")[4]
          ).toBeDisabled();
        });

        describe("faces errors", () => {
          it("should display amount of credits filed in error when negative value is filled", async () => {
            const clients = new ClientsBuilder()
              .withClient(
                new ApiClientBuilder()
                  .withFirstname("Pierre")
                  .withLastname("Martin")
                  .withId("1")
                  .withCredits([
                    { value: 2, subject: "MAT" },
                    {
                      value: 5,
                      subject: "MACHINE_DUO",
                    },
                  ])
                  .build()
              )
              .build();
            server.resetHandlers(
              new RequestHandlerBuilders()
                .get("/clients")
                .ok()
                .body(clients)
                .build()
            );
            render(<Clients />);

            userEvent.click(
              await screen.findByRole("button", { name: /martin/i })
            );
            const clientDetails = screen.getByRole("region");
            userEvent.type(
              within(clientDetails).getAllByText(/amount of credits/i)[0],
              "-1"
            );

            expect(
              within(clientDetails).getByDisplayValue(/-1/i)
            ).toBeInvalid();
            expect(
              within(clientDetails).getAllByRole("button", {
                name: /add credits/i,
              })[0]
            ).toBeDisabled();
          });
        });
      });
    });
  });
});
