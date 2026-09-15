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
const assertions_1 = require("../../../util/assertions");
const db_1 = require("../../../common/db");
const ActiveReservationsProjection_1 = require("./ActiveReservationsProjection");
const api = () => (router) => {
    /**
     * @openapi
     * /api/restaurants/{RestaurantId}/reservations:
     *   get:
     *     summary: List active reservations for a restaurant
     *     tags: [Reservations]
     *     parameters:
     *       - in: path
     *         name: RestaurantId
     *         required: true
     *         schema:
     *           type: string
     *           format: uuid
     *       - in: query
     *         name: Email
     *         required: false
     *         schema:
     *           type: string
     *         description: Filter reservations to a single guest's email
     *     responses:
     *       200:
     *         description: Active reservations for the restaurant
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 type: object
     *                 properties:
     *                   email:
     *                     type: string
     *                   code:
     *                     type: string
     *                   start:
     *                     type: string
     *                     format: date-time
     *                   end:
     *                     type: string
     *                     format: date-time
     *                   party_size:
     *                     type: integer
     *       500:
     *         description: Server error
     */
    router.get('/api/restaurants/:RestaurantId/reservations', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const restaurantId = (0, assertions_1.assertNotEmpty)(req.params.RestaurantId);
            const email = (_a = req.query.Email) === null || _a === void 0 ? void 0 : _a.toString();
            const db = (0, db_1.getKnexInstance)();
            let query = db(ActiveReservationsProjection_1.tableName)
                .withSchema('public')
                .where({ restaurant_id: restaurantId });
            if (email) {
                query = query.andWhere({ email });
            }
            const rows = yield query.select('email', 'code', 'start', 'end', 'party_size');
            return res.status(200).json(rows);
        }
        catch (err) {
            console.error(err);
            return res.status(500).json({ ok: false, error: 'Server error' });
        }
    }));
};
exports.api = api;
