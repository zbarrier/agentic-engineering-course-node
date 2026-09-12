"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const emmett_1 = require("@event-driven-io/emmett");
const PlaceReservationCommand_1 = require("./PlaceReservationCommand");
const node_test_1 = require("node:test");
(0, node_test_1.describe)('PlaceReservation Specification', () => {
    const given = emmett_1.DeciderSpecification.for({
        decide: PlaceReservationCommand_1.decide,
        evolve: PlaceReservationCommand_1.evolve,
        initialState: PlaceReservationCommand_1.PlaceReservationInitialState,
    });
    (0, node_test_1.it)('spec: Reservation Placed Successfully', () => {
        const command = {
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
    (0, node_test_1.it)('spec: Reservation Requires At Least One Person', () => {
        const command = {
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
    (0, node_test_1.it)('spec: End Must Be After Start', () => {
        const command = {
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
    (0, node_test_1.it)('spec: Reservation Cannot Be Placed In The Past', () => {
        const command = {
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
    (0, node_test_1.it)('spec: Reservation Id Must Be Unique', () => {
        const command = {
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
    (0, node_test_1.it)('spec: Reservation Code Must Be Globally Unique', () => {
        const command = {
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
