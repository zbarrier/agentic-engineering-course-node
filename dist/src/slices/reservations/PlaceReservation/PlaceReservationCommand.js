"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handlePlaceReservation = exports.decide = exports.evolve = exports.PlaceReservationInitialState = void 0;
const emmett_1 = require("@event-driven-io/emmett");
const loadPostgresEventstore_1 = require("../../../common/loadPostgresEventstore");
const PlaceReservationInitialState = () => ({});
exports.PlaceReservationInitialState = PlaceReservationInitialState;
const evolve = (state, event) => {
    const { type } = event;
    switch (type) {
        case 'ReservationPlaced':
            return Object.assign(Object.assign({}, state), { existingId: event.data.Id });
        default:
            return state;
    }
};
exports.evolve = evolve;
const decide = (command, state) => {
    var _a, _b;
    if (state.existingId === command.data.Id) {
        throw { code: 'reservation_already_exists', message: 'Reservation Already Exists' };
    }
    if (command.data.NumberOfPeople < 1) {
        throw { code: 'at_least_one_person_required', message: 'At Least 1 Person Required' };
    }
    if (new Date(command.data.End).getTime() <= new Date(command.data.Start).getTime()) {
        throw { code: 'end_must_be_after_start', message: 'End Must Be After Start' };
    }
    if (new Date(command.data.Start).getTime() <= Date.now()) {
        throw { code: 'reservation_in_past', message: 'Reservation Start Must Be In The Future' };
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
                correlation_id: (_a = command.metadata) === null || _a === void 0 ? void 0 : _a.correlation_id,
                causation_id: (_b = command.metadata) === null || _b === void 0 ? void 0 : _b.causation_id,
            },
        }];
};
exports.decide = decide;
const PlaceReservationCommandHandler = (0, emmett_1.CommandHandler)({
    evolve: exports.evolve,
    initialState: exports.PlaceReservationInitialState,
});
const handlePlaceReservation = (id, command) => __awaiter(void 0, void 0, void 0, function* () {
    const eventStore = yield (0, loadPostgresEventstore_1.findEventstore)();
    const result = yield PlaceReservationCommandHandler(eventStore, id, (state) => (0, exports.decide)(command, state));
    return {
        nextExpectedStreamVersion: result.nextExpectedStreamVersion,
        lastEventGlobalPosition: result.lastEventGlobalPosition,
    };
});
exports.handlePlaceReservation = handlePlaceReservation;
