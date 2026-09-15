import {Request, Response, Router} from 'express';
import {WebApiSetup} from '@event-driven-io/emmett-expressjs';
import {randomUUID} from 'crypto';
import {assertNotEmpty} from '../../../util/assertions';
import {PlaceReservationCommand, handlePlaceReservation} from './PlaceReservationCommand';

export const api = (): WebApiSetup => (router: Router): void => {

    /**
     * @openapi
     * /api/restaurants/{RestaurantId}/reservations:
     *   post:
     *     summary: Place a new reservation for a restaurant
     *     tags: [Reservations]
     *     parameters:
     *       - in: path
     *         name: RestaurantId
     *         required: true
     *         schema:
     *           type: string
     *           format: uuid
     *       - in: header
     *         name: correlation_id
     *         required: false
     *         schema:
     *           type: string
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required: [Email, Start, End, NumberOfPeople]
     *             properties:
     *               Email:
     *                 type: string
     *               Start:
     *                 type: string
     *                 format: date-time
     *               End:
     *                 type: string
     *                 format: date-time
     *               NumberOfPeople:
     *                 type: integer
     *     responses:
     *       201:
     *         description: Reservation placed successfully
     *         headers:
     *           correlation_id:
     *             schema:
     *               type: string
     *           causation_id:
     *             schema:
     *               type: string
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 ok:
     *                   type: boolean
     *                 id:
     *                   type: string
     *                   format: uuid
     *                 code:
     *                   type: string
     *                 next_expected_stream_version:
     *                   type: string
     *                 last_event_global_position:
     *                   type: string
     *       409:
     *         description: >
     *           Reservation could not be placed (Reservation Already Exists,
     *           At Least 1 Person Required, End Must Be After Start,
     *           or Reservation Start Must Be In The Future)
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 error:
     *                   type: string
     *       500:
     *         description: Server error
     */
    router.post('/api/restaurants/:RestaurantId/reservations', async (req: Request, res: Response) => {
        const restaurantId = assertNotEmpty(req.params.RestaurantId);
        const id = randomUUID();
        const correlationId = req.header('correlation_id') ?? id;

        try {
            const command: PlaceReservationCommand = {
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

            const result = await handlePlaceReservation(id, command);

            res.set('correlation_id', correlationId);
            res.set('causation_id', id);

            return res.status(201).json({
                ok: true,
                id,
                code: command.data.Code,
                next_expected_stream_version: result.nextExpectedStreamVersion?.toString(),
                last_event_global_position: result.lastEventGlobalPosition?.toString(),
            });
        } catch (err: any) {
            const errorMessage = errorMapping(err?.code);
            if (errorMessage) {
                return res.status(409).json({error: errorMessage});
            }
            console.error(err);
            return res.status(500).json({ok: false, error: 'Server error'});
        }
    });
};

const generateCode = (): string => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
};

const errorMapping = (code: string): string | null => {
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
