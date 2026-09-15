import {Request, Response, Router} from 'express';
import {WebApiSetup} from '@event-driven-io/emmett-expressjs';
import {assertNotEmpty} from '../../../util/assertions';
import {getKnexInstance} from '../../../common/db';
import {tableName} from './ActiveReservationsProjection';

export const api = (): WebApiSetup => (router: Router): void => {

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
    router.get('/api/restaurants/:RestaurantId/reservations', async (req: Request, res: Response) => {
        try {
            const restaurantId = assertNotEmpty(req.params.RestaurantId);
            const email = req.query.Email?.toString();

            const db = getKnexInstance();
            let query = db(tableName)
                .withSchema('public')
                .where({restaurant_id: restaurantId});

            if (email) {
                query = query.andWhere({email});
            }

            const rows = await query.select('email', 'code', 'start', 'end', 'party_size');

            return res.status(200).json(rows);
        } catch (err) {
            console.error(err);
            return res.status(500).json({ok: false, error: 'Server error'});
        }
    });
};
