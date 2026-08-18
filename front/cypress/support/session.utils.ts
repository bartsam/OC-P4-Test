import { faker } from '@faker-js/faker';

export const createTestSession = () =>
  cy.getSessionToken().then((token) =>
    cy
      .request({
        method: 'POST',
        url: '/api/session',
        headers: { Authorization: `Bearer ${token}` },
        body: {
          name: faker.lorem.words(3),
          date: faker.date.soon().toISOString(),
          teacher_id: 1,
          description: faker.lorem.sentence(10),
        },
      })
      .its('body'),
  );

export const deleteTestSession = (id: number) =>
  cy.getSessionToken().then((token) =>
    cy.request({
      method: 'DELETE',
      url: `/api/session/${id}`,
      headers: { Authorization: `Bearer ${token}` },
      failOnStatusCode: false,
    }),
  );
