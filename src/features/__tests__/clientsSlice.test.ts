import reducer, { addCredits, fetchClients } from "../clientsSlice";
import { LoadingState } from "../../test-utils/features/clients/clientStateFixtures";
import { FulFilledAction } from "../../test-utils/features/actionFixtures";
import {
  ClientBuilder,
  ClientsBuilder,
} from "../../test-utils/clients/clients";
import { Subjects } from "../domain/subjects";

describe("ClientsSlice", () => {
  describe("Fetching clients", () => {
    it("should override previous state with fetched clients", async () => {
      const previousState = new LoadingState()
        .withClient(
          new ClientBuilder().withFirstname("John").withLastname("Doe").build()
        )
        .build();
      const all_clients = new ClientsBuilder()
        .withClient(new ClientBuilder().build())
        .withClient(
          new ClientBuilder()
            .withFirstname("Pierre")
            .withLastname("Martin")
            .build()
        )
        .withClient(
          new ClientBuilder()
            .withId("33da6bca-efda-4c16-b8af-e5e822fc5901")
            .withFirstname("Henri")
            .withLastname("Verneuil")
            .build()
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
          new ClientBuilder()
            .withId("1")
            .withFirstname("John")
            .withLastname("Doe")
            .withCredits([
              {
                value: 5,
                subject: Subjects.MAT,
              },
            ])
            .build()
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
          new ClientBuilder()
            .withId("1")
            .withFirstname("John")
            .withLastname("Doe")
            .withCredits([
              {
                value: 5,
                subject: Subjects.MAT,
              },
            ])
            .build()
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
