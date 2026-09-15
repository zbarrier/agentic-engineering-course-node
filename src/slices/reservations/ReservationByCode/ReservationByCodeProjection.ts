import {postgreSQLRawSQLProjection} from '@event-driven-io/emmett-postgresql';
import {sql, SQL} from '@event-driven-io/dumbo';
import knex, {Knex} from 'knex';
import {type ReservationPlaced} from '../ReservationsEvents';

export const tableName = 'reservation_by_code';

export type ReservationByCodeReadModel = {
    id: string;
    restaurantId: string;
    code: string;
    email: string;
    start: string;
    end: string;
    partySize: number;
};

export const getKnexInstance = (): Knex => knex({client: 'pg'});

type ReservationByCodeEvents = ReservationPlaced;

export const ReservationByCodeProjection = postgreSQLRawSQLProjection<ReservationByCodeEvents>({
    name: 'ReservationByCodeProjection',
    canHandle: ['ReservationPlaced'],
    evolve: async (event, context): Promise<SQL[]> => {
        const db = getKnexInstance();

        switch (event.type) {
            case 'ReservationPlaced':
                return [sql(db(tableName)
                    .withSchema('public')
                    .insert({
                        id: event.data.Id,
                        restaurant_id: event.data.RestaurantId,
                        code: event.data.Code,
                        email: event.data.Email,
                        start: event.data.Start,
                        end: event.data.End,
                        party_size: event.data.NumberOfPeople,
                    })
                    .onConflict('id')
                    .merge(['restaurant_id', 'code', 'email', 'start', 'end', 'party_size'])
                    .toQuery())];

            default:
                return [];
        }
    },
});
