import { ApiClient, ApiCredits } from "../../api";
import { Client, Credits } from "../../features/domain/client";
import { Builder } from "../builder";
import { faker } from "@faker-js/faker";
import { Subjects } from "../../features/domain/subjects";

export class ClientsBuilder implements Builder<(Client | ApiClient)[]> {
  private clients: (Client | ApiClient)[] = [];

  public withClient = (client: Client | ApiClient): ClientsBuilder => {
    this.clients.push(client);
    return this;
  };

  public build = (): (Client | ApiClient)[] => {
    return this.clients;
  };

  public for = (numberOfClients: number): ClientsBuilder => {
    for (let i = 0; i < numberOfClients; i++) {
      this.clients.push(new ClientBuilder().build());
    }
    return this;
  };
}

export class ClientCreditsBuilder
  implements Builder<{ value: number; subject: string }[]>
{
  private credits: { value: number; subject: string }[] = [];

  build(): { value: number; subject: string }[] {
    return this.credits;
  }

  all = (): ClientCreditsBuilder => {
    for (let subject in Subjects) {
      this.credits.push({
        value: faker.datatype.number({ min: 1, max: 10 }),
        subject,
      });
    }
    return this;
  };
}

export class ApiClientBuilder implements Builder<ApiClient> {
  private firstname: string = faker.name.firstName();
  private lastname: string = faker.name.lastName();
  private id: string = faker.datatype.uuid();
  private credits: { value: number; subject: string }[] | [] = [];

  withId = (id: string): ApiClientBuilder => {
    this.id = id;
    return this;
  };

  withFirstname = (firstname: string): ApiClientBuilder => {
    this.firstname = firstname;
    return this;
  };

  withLastname = (lastname: string): ApiClientBuilder => {
    this.lastname = lastname;
    return this;
  };
  withCredits = (
    credits: { value: number; subject: string }[] | []
  ): ApiClientBuilder => {
    this.credits = credits;
    return this;
  };

  build(): ApiClient {
    return {
      firstname: this.firstname,
      lastname: this.lastname,
      id: this.id,
      credits: this.credits,
    };
  }
}

export class ClientBuilder implements Builder<Client> {
  private id: string = faker.datatype.uuid();
  private firstname: string = faker.name.firstName();
  private lastname: string = faker.name.lastName();
  private credits: Credits[] = [];

  withId = (id: string): ClientBuilder => {
    this.id = id;
    return this;
  };

  withFirstname = (firstname: string): ClientBuilder => {
    this.firstname = firstname;
    return this;
  };

  withLastname = (lastname: string): ClientBuilder => {
    this.lastname = lastname;
    return this;
  };

  withCredits = (credits: Credits[] | undefined): ClientBuilder => {
    this.credits = credits || [];
    return this;
  };

  build(): Client {
    return {
      id: this.id,
      firstname: this.firstname,
      lastname: this.lastname,
      credits: this.credits,
    };
  }
}
