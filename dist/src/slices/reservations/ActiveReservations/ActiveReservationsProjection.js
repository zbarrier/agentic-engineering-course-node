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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActiveReservationsProjection = exports.getKnexInstance = exports.tableName = void 0;
const emmett_postgresql_1 = require("@event-driven-io/emmett-postgresql");
const dumbo_1 = require("@event-driven-io/dumbo");
const knex_1 = __importDefault(require("knex"));
exports.tableName = 'active_reservations';
const getKnexInstance = () => (0, knex_1.default)({ client: 'pg' });
exports.getKnexInstance = getKnexInstance;
exports.ActiveReservationsProjection = (0, emmett_postgresql_1.postgreSQLRawSQLProjection)({
    name: 'ActiveReservationsProjection',
    canHandle: ['ReservationPlaced', 'ReservationCancelled'],
    evolve: (event, context) => __awaiter(void 0, void 0, void 0, function* () {
        const db = (0, exports.getKnexInstance)();
        switch (event.type) {
            case 'ReservationPlaced':
                return [(0, dumbo_1.sql)(db(exports.tableName)
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
                return [(0, dumbo_1.sql)(db(exports.tableName)
                        .withSchema('public')
                        .where({ id: event.data.Id })
                        .delete()
                        .toQuery())];
            default:
                return [];
        }
    }),
});
