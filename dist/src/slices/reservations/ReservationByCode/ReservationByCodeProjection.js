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
exports.ReservationByCodeProjection = exports.getKnexInstance = exports.tableName = void 0;
const emmett_postgresql_1 = require("@event-driven-io/emmett-postgresql");
const dumbo_1 = require("@event-driven-io/dumbo");
const knex_1 = __importDefault(require("knex"));
exports.tableName = 'reservation_by_code';
const getKnexInstance = () => (0, knex_1.default)({ client: 'pg' });
exports.getKnexInstance = getKnexInstance;
exports.ReservationByCodeProjection = (0, emmett_postgresql_1.postgreSQLRawSQLProjection)({
    name: 'ReservationByCodeProjection',
    canHandle: ['ReservationPlaced'],
    evolve: (event, context) => __awaiter(void 0, void 0, void 0, function* () {
        const db = (0, exports.getKnexInstance)();
        switch (event.type) {
            case 'ReservationPlaced':
                return [(0, dumbo_1.sql)(db(exports.tableName)
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
    }),
});
