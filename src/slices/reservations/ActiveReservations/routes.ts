import {Request, Response, Router} from 'express';
import {WebApiSetup} from '@event-driven-io/emmett-expressjs';
import {assertNotEmpty} from '../../../util/assertions';
import {getKnexInstance} from '../../../common/db';
import {tableName} from './ActiveReservationsProjection';

export const api = (): WebApiSetup => (router: Router): void => {

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

            const rows = await query.select('email', 'code', 'start', 'end', 'number_of_people');

            return res.status(200).json(rows);
        } catch (err) {
            console.error(err);
            return res.status(500).json({ok: false, error: 'Server error'});
        }
    });
};
