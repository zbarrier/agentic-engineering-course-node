import {before, after, describe, it} from 'node:test';
import {PostgreSQLProjectionAssert, PostgreSQLProjectionSpec} from '@event-driven-io/emmett-postgresql';
import {ReservationByCodeProjection} from './ReservationByCodeProjection';
import {PostgreSqlContainer, StartedPostgreSqlContainer} from '@testcontainers/postgresql';
import knex, {Knex} from 'knex';
import assert from 'assert';
import {runFlywayMigrations} from '../../../common/testHelpers';

const TEST_ID = 'test-id-001';

describe('ReservationByCode Specification', () => {
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
            projection: ReservationByCodeProjection,
            connectionString,
        });
    });

    after(async () => {
        await db?.destroy();
        await postgres?.stop();
    });

    it('spec: Reservation Found By Its Code', async () => {
        const assertReadModel: PostgreSQLProjectionAssert = async ({connectionString: connStr}) => {
            const queryDb = knex({client: 'pg', connection: connStr});
            try {
                const result = await queryDb('reservation_by_code')
                    .withSchema('public')
                    .where({code: 'R7K2QX'})
                    .first();

                assert.ok(result, 'row should exist');
                assert.strictEqual(result.id, TEST_ID);
                assert.strictEqual(result.code, 'R7K2QX');
                assert.strictEqual(result.email, 'guest@example.com');
                assert.strictEqual(result.party_size, 4);
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
});
