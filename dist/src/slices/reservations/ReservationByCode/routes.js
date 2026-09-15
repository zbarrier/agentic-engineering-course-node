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
const ReservationByCodeProjection_1 = require("./ReservationByCodeProjection");
const api = () => (router) => {
    /**
     * @openapi
     * /api/reservations/by-code/{Code}:
     *   get:
     *     summary: Look up a reservation by its confirmation code
     *     tags: [Reservations]
     *     parameters:
     *       - in: path
     *         name: Code
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: The reservation matching the code
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 id:
     *                   type: string
     *                 restaurant_id:
     *                   type: string
     *                 code:
     *                   type: string
     *                 email:
     *                   type: string
     *                 start:
     *                   type: string
     *                   format: date-time
     *                 end:
     *                   type: string
     *                   format: date-time
     *                 party_size:
     *                   type: integer
     *       404:
     *         description: No reservation found for this code
     *       500:
     *         description: Server error
     */
    router.get('/api/reservations/by-code/:Code', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const code = (0, assertions_1.assertNotEmpty)(req.params.Code);
            const db = (0, db_1.getKnexInstance)();
            const row = yield db(ReservationByCodeProjection_1.tableName)
                .withSchema('public')
                .where({ code })
                .select('id', 'restaurant_id', 'code', 'email', 'start', 'end', 'party_size')
                .first();
            if (!row) {
                return res.status(404).json({ ok: false, error: 'Reservation Not Found' });
            }
            return res.status(200).json(row);
        }
        catch (err) {
            console.error(err);
            return res.status(500).json({ ok: false, error: 'Server error' });
        }
    }));
};
exports.api = api;
