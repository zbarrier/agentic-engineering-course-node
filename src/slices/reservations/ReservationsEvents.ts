import type {Event} from '@event-driven-io/emmett';

type CommonMeta = {
    stream_name?: string;
    userId?: string;
    correlation_id?: string;
    causation_id?: string;
};

export type ReservationPlaced = Event<'ReservationPlaced', {
    Id: string;
    RestaurantId: string;
    Email: string;
    Start: string;
    End: string;
    NumberOfPeople: number;
    Code: string;
}, CommonMeta>;

export type ReservationCancelled = Event<'ReservationCancelled', {
    Id: string;
    RestaurantId: string;
}, CommonMeta>;

export type ReservationsEvents = ReservationPlaced | ReservationCancelled;
