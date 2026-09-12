import {postgreSQLRawSQLProjection} from '@event-driven-io/emmett-postgresql';
import {sql, SQL} from '@event-driven-io/dumbo';
import knex, {Knex} from 'knex';
import {type ReservationPlaced, type ReservationCancelled} from '../ReservationsEvents';

export const tableName = 'active_reservations';

export type ActiveReservationsReadModel = {
    id: string;
    restaurantId: string;
    email: string;
    code: string;
    start: string;
    end: string;
    numberOfPeople: number;
};

export const getKnexInstance = (): Knex => knex({client: 'pg'});

type ActiveReservationsEvents = ReservationPlaced | ReservationCancelled;

export const ActiveReservationsProjection = postgreSQLRawSQLProjection<ActiveReservationsEvents>({
    name: 'ActiveReservationsProjection',
    canHandle: ['ReservationPlaced', 'ReservationCancelled'],
    evolve: async (event, context): Promise<SQL[]> => {
        const db = getKnexInstance();

        switch (event.type) {
            case 'ReservationPlaced':
                return [sql(db(tableName)
                    .withSchema('public')
                    .insert({
                        id: event.data.Id,
                        restaurant_id: event.data.RestaurantId,
                        email: event.data.Email,
                        code: event.data.Code,
                        start: event.data.Start,
                        end: event.data.End,
                        number_of_people: event.data.NumberOfPeople,
                    })
                    .onConflict('id')
                    .merge(['restaurant_id', 'email', 'code', 'start', 'end', 'number_of_people'])
                    .toQuery())];

            case 'ReservationCancelled':
                return [sql(db(tableName)
                    .withSchema('public')
                    .where({id: event.data.Id})
                    .delete()
                    .toQuery())];

            default:
                return [];
        }
    },
});
