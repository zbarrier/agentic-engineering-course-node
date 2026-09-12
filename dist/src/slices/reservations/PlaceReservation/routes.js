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
exports.api = void 0;
const crypto_1 = require("crypto");
const assertions_1 = require("../../../util/assertions");
const PlaceReservationCommand_1 = require("./PlaceReservationCommand");
const api = () => (router) => {
    router.post('/api/restaurants/:RestaurantId/reservations', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c;
        const restaurantId = (0, assertions_1.assertNotEmpty)(req.params.RestaurantId);
        const id = (0, crypto_1.randomUUID)();
        const correlationId = (_a = req.header('correlation_id')) !== null && _a !== void 0 ? _a : id;
        try {
            const command = {
                type: 'PlaceReservation',
                data: {
                    Id: id,
                    RestaurantId: restaurantId,
                    Email: req.body.Email,
                    Start: req.body.Start,
                    End: req.body.End,
                    NumberOfPeople: req.body.NumberOfPeople,
                    Code: generateCode(),
                },
                metadata: {
                    correlation_id: correlationId,
                    causation_id: id,
                },
            };
            const result = yield (0, PlaceReservationCommand_1.handlePlaceReservation)(id, command);
            res.set('correlation_id', correlationId);
            res.set('causation_id', id);
            return res.status(201).json({
                ok: true,
                id,
                code: command.data.Code,
                next_expected_stream_version: (_b = result.nextExpectedStreamVersion) === null || _b === void 0 ? void 0 : _b.toString(),
                last_event_global_position: (_c = result.lastEventGlobalPosition) === null || _c === void 0 ? void 0 : _c.toString(),
            });
        }
        catch (err) {
            const errorMessage = errorMapping(err === null || err === void 0 ? void 0 : err.code);
            if (errorMessage) {
                return res.status(409).json({ error: errorMessage });
            }
            console.error(err);
            return res.status(500).json({ ok: false, error: 'Server error' });
        }
    }));
};
exports.api = api;
const generateCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
};
const errorMapping = (code) => {
    switch (code) {
        case 'reservation_already_exists':
            return 'Reservation Already Exists';
        case 'at_least_one_person_required':
            return 'At Least 1 Person Required';
        case 'end_must_be_after_start':
            return 'End Must Be After Start';
        case 'reservation_in_past':
            return 'Reservation Start Must Be In The Future';
        default:
            return null;
    }
};
