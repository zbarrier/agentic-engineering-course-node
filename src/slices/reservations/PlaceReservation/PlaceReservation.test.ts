import {DeciderSpecification} from '@event-driven-io/emmett';
import {
    PlaceReservationCommand,
    PlaceReservationInitialState,
    decide,
    evolve,
} from './PlaceReservationCommand';
import {describe, it} from 'node:test';

describe('PlaceReservation Specification', () => {
    const given = DeciderSpecification.for({
        decide,
        evolve,
        initialState: PlaceReservationInitialState,
    });

    it('spec: Reservation Placed Successfully', () => {
        const command: PlaceReservationCommand = {
            type: 'PlaceReservation',
            data: {
                Id: '1',
                RestaurantId: '100',
                Email: 'guest@example.com',
                Start: '2026-09-18T19:00:00Z',
                End: '2026-09-18T21:00:00Z',
                NumberOfPeople: 4,
                Code: 'R7K2QX',
            },
            metadata: {},
        };

        given([])
            .when(command)
            .then([{
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
                metadata: {},
            }]);
    });

    it('spec: Reservation Requires At Least One Person', () => {
        const command: PlaceReservationCommand = {
            type: 'PlaceReservation',
            data: {
                Id: '1',
                RestaurantId: '100',
                Email: 'guest@example.com',
                Start: '2026-09-18T19:00:00Z',
                End: '2026-09-18T21:00:00Z',
                NumberOfPeople: 0,
                Code: 'R7K2QX',
            },
            metadata: {},
        };

        given([])
            .when(command)
            .thenThrows();
    });

    it('spec: End Must Be After Start', () => {
        const command: PlaceReservationCommand = {
            type: 'PlaceReservation',
            data: {
                Id: '1',
                RestaurantId: '100',
                Email: 'guest@example.com',
                Start: '2026-09-18T21:00:00Z',
                End: '2026-09-18T19:00:00Z',
                NumberOfPeople: 4,
                Code: 'R7K2QX',
            },
            metadata: {},
        };

        given([])
            .when(command)
            .thenThrows();
    });

    it('spec: Reservation Cannot Be Placed In The Past', () => {
        const command: PlaceReservationCommand = {
            type: 'PlaceReservation',
            data: {
                Id: '1',
                RestaurantId: '100',
                Email: 'guest@example.com',
                Start: '2026-09-01T19:00:00Z',
                End: '2026-09-01T21:00:00Z',
                NumberOfPeople: 4,
                Code: 'R7K2QX',
            },
            metadata: {},
        };

        given([])
            .when(command)
            .thenThrows();
    });

    it('spec: Reservation Id Must Be Unique', () => {
        const command: PlaceReservationCommand = {
            type: 'PlaceReservation',
            data: {
                Id: '1',
                RestaurantId: '100',
                Email: 'other@example.com',
                Start: '2026-09-20T18:00:00Z',
                End: '2026-09-20T20:00:00Z',
                NumberOfPeople: 2,
                Code: 'M3P8ZW',
            },
            metadata: {},
        };

        given([{
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
            metadata: {},
        }])
            .when(command)
            .thenThrows();
    });

    it('spec: Reservation Code Must Be Globally Unique', () => {
        const command: PlaceReservationCommand = {
            type: 'PlaceReservation',
            data: {
                Id: '2',
                RestaurantId: '200',
                Email: 'other@example.com',
                Start: '2026-09-20T18:00:00Z',
                End: '2026-09-20T20:00:00Z',
                NumberOfPeople: 2,
                Code: 'M3P8ZW',
            },
            metadata: {},
        };

        given([{
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
            metadata: {},
        }])
            .when(command)
            .then([{
                type: 'ReservationPlaced',
                data: {
                    Id: '2',
                    RestaurantId: '200',
                    Email: 'other@example.com',
                    Start: '2026-09-20T18:00:00Z',
                    End: '2026-09-20T20:00:00Z',
                    NumberOfPeople: 2,
                    Code: 'M3P8ZW',
                },
                metadata: {},
            }]);
    });
});
