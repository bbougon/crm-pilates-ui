import reducer, { addCredits, fetchClients } from "../clientsSlice";
import { LoadingState } from "../../test-utils/features/clients/clientStateFixtures";
import { FulFilledAction } from "../../test-utils/features/actionFixtures";
import { ClientsBuilder, client } from "../../test-utils/clients/clients";
import { Subjects } from "../domain/subjects";

describe("ClientsSlice", () => {
  describe("Fetching clients", () => {
    it("should override previous state with fetched clients", async () => {
      const previousState = new LoadingState().withClient(client()).build();
      const all_clients = new ClientsBuilder()
        .withClient(client(undefined, undefined, undefined, undefined))
        .withClient(
          client(
            "Pierre",
            "Martin",
            "33da6f24-efda-4c16-b8af-e5e822fc5860",
            undefined
          )
        )
        .withClient(
          client(
            "Henri",
            "Verneuil",
            "33da6bca-efda-4c16-b8af-e5e822fc5901",
            undefined
          )
        )
        .build();
      const action = new FulFilledAction(fetchClients)
        .withPayload({ clients: all_clients })
        .build();

      expect(reducer(previousState, action)).toEqual({
        clients: all_clients,
        status: "succeeded",
        error: [],
      });
    });
  });

  describe("Adding credits", () => {
    it("should add credits to client", async () => {
      const previousState = new LoadingState()
        .withClient(
          client("John", "Doe", "1", [
            {
              value: 5,
              subject: Subjects.MAT,
            },
          ])
        )
        .build();

      const action = new FulFilledAction(addCredits)
        .withPayload({
          clientId: "1",
          creditsAmount: 10,
          subject: "MACHINE_DUO",
        })
        .build();

      expect(reducer(previousState, action)).toEqual({
        clients: [
          {
            firstname: "John",
            lastname: "Doe",
            id: "1",
            credits: [
              {
                value: 5,
                subject: "MAT",
              },
              {
                value: 10,
                subject: "MACHINE_DUO",
              },
            ],
          },
        ],
        status: "succeeded",
        error: [],
      });
    });

    it("should update client credits", async () => {
      const previousState = new LoadingState()
        .withClient(
          client("John", "Doe", "1", [
            {
              value: 5,
              subject: Subjects.MAT,
            },
          ])
        )
        .build();

      const action = new FulFilledAction(addCredits)
        .withPayload({
          clientId: "1",
          creditsAmount: 10,
          subject: "MAT",
        })
        .build();

      expect(reducer(previousState, action)).toEqual({
        clients: [
          {
            firstname: "John",
            lastname: "Doe",
            id: "1",
            credits: [
              {
                value: 15,
                subject: "MAT",
              },
            ],
          },
        ],
        status: "succeeded",
        error: [],
      });
    });
  });
});
