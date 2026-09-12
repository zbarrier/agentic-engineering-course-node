import {before, after, describe, it} from 'node:test';
import {PostgreSQLProjectionAssert, PostgreSQLProjectionSpec} from '@event-driven-io/emmett-postgresql';
import {ActiveReservationsProjection} from './ActiveReservationsProjection';
import {PostgreSqlContainer, StartedPostgreSqlContainer} from '@testcontainers/postgresql';
import knex, {Knex} from 'knex';
import assert from 'assert';
import {runFlywayMigrations} from '../../../common/testHelpers';

const TEST_ID = 'test-id-001';

describe('ActiveReservations Specification', () => {
    let postgres: StartedPostgreSqlContainer;
    let connectionString: string;
    let db: Knex;
    let given: PostgreSQLProjectionSpec<any>;

    before(async () => {
        postgres = await new PostgreSqlContainer('postgres').start();
        connectionString = postgres.getConnectionUri();

        db = knex({client: 'pg', connection: connectionString});

        await runFlywayMigrations(connectionString);

        given = PostgreSQLProjectionSpec.for({
            projection: ActiveReservationsProjection,
            connectionString,
        });
    });

    after(async () => {
        await db?.destroy();
        await postgres?.stop();
    });

    it('spec: ActiveReservations - inserts row on ReservationPlaced', async () => {
        const assertReadModel: PostgreSQLProjectionAssert = async ({connectionString: connStr}) => {
            const queryDb = knex({client: 'pg', connection: connStr});
            try {
                const result = await queryDb('active_reservations')
                    .withSchema('public')
                    .where({id: TEST_ID})
                    .first();

                assert.ok(result, 'row should exist');
                assert.strictEqual(result.id, TEST_ID);
                assert.strictEqual(result.restaurant_id, '100');
                assert.strictEqual(result.email, 'guest@example.com');
                assert.strictEqual(result.code, 'R7K2QX');
                assert.strictEqual(result.number_of_people, 4);
            } finally {
                await queryDb.destroy();
            }
        };

        await given([{
            type: 'ReservationPlaced',
            data: {
                Id: TEST_ID,
                RestaurantId: '100',
                Email: 'guest@example.com',
                Start: '2026-09-18T19:00:00Z',
                End: '2026-09-18T21:00:00Z',
                NumberOfPeople: 4,
                Code: 'R7K2QX',
            },
            metadata: {stream_name: `reservations-${TEST_ID}`},
        }])
            .when([])
            .then(assertReadModel);
    });

    it('spec: ActiveReservations - removes row on ReservationCancelled', async () => {
        const assertReadModel: PostgreSQLProjectionAssert = async ({connectionString: connStr}) => {
            const queryDb = knex({client: 'pg', connection: connStr});
            try {
                const result = await queryDb('active_reservations')
                    .withSchema('public')
                    .where({id: TEST_ID})
                    .first();

                assert.strictEqual(result, undefined, 'row should be deleted');
            } finally {
                await queryDb.destroy();
            }
        };

        await given([
            {
                type: 'ReservationPlaced',
                data: {
                    Id: TEST_ID,
                    RestaurantId: '100',
                    Email: 'guest@example.com',
                    Start: '2026-09-18T19:00:00Z',
                    End: '2026-09-18T21:00:00Z',
                    NumberOfPeople: 4,
                    Code: 'R7K2QX',
                },
                metadata: {stream_name: `reservations-${TEST_ID}`},
            },
            {
                type: 'ReservationCancelled',
                data: {
                    Id: TEST_ID,
                    RestaurantId: '100',
                },
                metadata: {stream_name: `reservations-${TEST_ID}`},
            },
        ])
            .when([])
            .then(assertReadModel);
    });
});

describe('ActiveReservations Storyline: Storyline #1', () => {
    let postgres: StartedPostgreSqlContainer;
    let db: Knex;
    let given: PostgreSQLProjectionSpec<any>;

    before(async () => {
        postgres = await new PostgreSqlContainer('postgres').start();
        const connectionString = postgres.getConnectionUri();

        db = knex({client: 'pg', connection: connectionString});

        await runFlywayMigrations(connectionString);

        given = PostgreSQLProjectionSpec.for({
            projection: ActiveReservationsProjection,
            connectionString,
        });
    });

    after(async () => {
        await db?.destroy();
        await postgres?.stop();
    });

    it('spec: Storyline #1 — after Reservation Placed', async () => {
        const assertReadModel: PostgreSQLProjectionAssert = async ({connectionString: connStr}) => {
            const queryDb = knex({client: 'pg', connection: connStr});
            try {
                const result = await queryDb('active_reservations')
                    .withSchema('public')
                    .where({id: '1'})
                    .first();

                assert.ok(result, 'row should exist');
            } finally {
                await queryDb.destroy();
            }
        };

        await given([{
            type: 'ReservationPlaced',
            data: {
                Id: '1',
                RestaurantId: '100',
                Email: 'guest@example.com',
                Start: '2026-09-18T19:00:00Z',
                End: '2026-09-18T21:00:00Z',
                NumberOfPeople: 4,
                Code: 'R7K2QX',
            },
            metadata: {stream_name: 'reservations-1'},
        }])
            .when([])
            .then(assertReadModel);
    });

    it('spec: Storyline #1 — after Reservation Cancelled', async () => {
        const assertReadModel: PostgreSQLProjectionAssert = async ({connectionString: connStr}) => {
            const queryDb = knex({client: 'pg', connection: connStr});
            try {
                const result = await queryDb('active_reservations')
                    .withSchema('public')
                    .where({id: '1'})
                    .first();

                assert.strictEqual(result, undefined, 'row should be removed');
            } finally {
                await queryDb.destroy();
            }
        };

        await given([
            {
                type: 'ReservationPlaced',
                data: {
                    Id: '1',
                    RestaurantId: '100',
                    Email: 'guest@example.com',
                    Start: '2026-09-18T19:00:00Z',
                    End: '2026-09-18T21:00:00Z',
                    NumberOfPeople: 4,
                    Code: 'R7K2QX',
                },
                metadata: {stream_name: 'reservations-1'},
            },
            {
                type: 'ReservationCancelled',
                data: {
                    Id: '1',
                    RestaurantId: '100',
                },
                metadata: {stream_name: 'reservations-1'},
            },
        ])
            .when([])
            .then(assertReadModel);
    });
});
