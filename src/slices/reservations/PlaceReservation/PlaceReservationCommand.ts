import type {Command} from '@event-driven-io/emmett';
import {CommandHandler} from '@event-driven-io/emmett';
import {type ReservationsEvents} from '../ReservationsEvents';
import {findEventstore} from '../../../common/loadPostgresEventstore';

export type PlaceReservationCommand = Command<'PlaceReservation', {
    Id: string;
    RestaurantId: string;
    Email: string;
    Start: string;
    End: string;
    NumberOfPeople: number;
    Code: string;
}, {
    correlation_id?: string;
    causation_id?: string;
}>;

export type PlaceReservationState = {
    existingId?: string;
};

export const PlaceReservationInitialState = (): PlaceReservationState => ({});

export const evolve = (
    state: PlaceReservationState,
    event: ReservationsEvents,
): PlaceReservationState => {
    const {type} = event;

    switch (type) {
        case 'ReservationPlaced':
            return {...state, existingId: event.data.Id};
        default:
            return state;
    }
};

export const decide = (
    command: PlaceReservationCommand,
    state: PlaceReservationState,
): ReservationsEvents[] => {
    if (state.existingId === command.data.Id) {
        throw {code: 'reservation_already_exists', message: 'Reservation Already Exists'};
    }

    if (command.data.NumberOfPeople < 1) {
        throw {code: 'at_least_one_person_required', message: 'At Least 1 Person Required'};
    }

    if (new Date(command.data.End).getTime() <= new Date(command.data.Start).getTime()) {
        throw {code: 'end_must_be_after_start', message: 'End Must Be After Start'};
    }

    if (new Date(command.data.Start).getTime() <= Date.now()) {
        throw {code: 'reservation_in_past', message: 'Reservation Start Must Be In The Future'};
    }

    return [{
        type: 'ReservationPlaced',
        data: {
            Id: command.data.Id,
            RestaurantId: command.data.RestaurantId,
            Email: command.data.Email,
            Start: command.data.Start,
            End: command.data.End,
            NumberOfPeople: command.data.NumberOfPeople,
            Code: command.data.Code,
        },
        metadata: {
            correlation_id: command.metadata?.correlation_id,
            causation_id: command.metadata?.causation_id,
        },
    }];
};

const PlaceReservationCommandHandler = CommandHandler<PlaceReservationState, ReservationsEvents>({
    evolve,
    initialState: PlaceReservationInitialState,
});

export const handlePlaceReservation = async (id: string, command: PlaceReservationCommand) => {
    const eventStore = await findEventstore();
    const result = await PlaceReservationCommandHandler(
        eventStore,
        id,
        (state: PlaceReservationState) => decide(command, state),
    );
    return {
        nextExpectedStreamVersion: result.nextExpectedStreamVersion,
        lastEventGlobalPosition: result.lastEventGlobalPosition,
    };
};
