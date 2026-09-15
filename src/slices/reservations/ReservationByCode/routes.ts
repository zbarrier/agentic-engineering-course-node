import {Request, Response, Router} from 'express';
import {WebApiSetup} from '@event-driven-io/emmett-expressjs';
import {assertNotEmpty} from '../../../util/assertions';
import {getKnexInstance} from '../../../common/db';
import {tableName} from './ReservationByCodeProjection';

export const api = (): WebApiSetup => (router: Router): void => {

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
    router.get('/api/reservations/by-code/:Code', async (req: Request, res: Response) => {
        try {
            const code = assertNotEmpty(req.params.Code);

            const db = getKnexInstance();
            const row = await db(tableName)
                .withSchema('public')
                .where({code})
                .select('id', 'restaurant_id', 'code', 'email', 'start', 'end', 'party_size')
                .first();

            if (!row) {
                return res.status(404).json({ok: false, error: 'Reservation Not Found'});
            }

            return res.status(200).json(row);
        } catch (err) {
            console.error(err);
            return res.status(500).json({ok: false, error: 'Server error'});
        }
    });
};
