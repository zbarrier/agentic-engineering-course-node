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
const node_test_1 = require("node:test");
const emmett_postgresql_1 = require("@event-driven-io/emmett-postgresql");
const ReservationByCodeProjection_1 = require("./ReservationByCodeProjection");
const postgresql_1 = require("@testcontainers/postgresql");
const knex_1 = __importDefault(require("knex"));
const assert_1 = __importDefault(require("assert"));
const testHelpers_1 = require("../../../common/testHelpers");
const TEST_ID = 'test-id-001';
(0, node_test_1.describe)('ReservationByCode Specification', () => {
    let postgres;
    let connectionString;
    let db;
    let given;
    (0, node_test_1.before)(() => __awaiter(void 0, void 0, void 0, function* () {
        postgres = yield new postgresql_1.PostgreSqlContainer('postgres').start();
        connectionString = postgres.getConnectionUri();
        db = (0, knex_1.default)({ client: 'pg', connection: connectionString });
        yield (0, testHelpers_1.runFlywayMigrations)(connectionString);
        given = emmett_postgresql_1.PostgreSQLProjectionSpec.for({
            projection: ReservationByCodeProjection_1.ReservationByCodeProjection,
            connectionString,
        });
    }));
    (0, node_test_1.after)(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (db === null || db === void 0 ? void 0 : db.destroy());
        yield (postgres === null || postgres === void 0 ? void 0 : postgres.stop());
    }));
    (0, node_test_1.it)('spec: Reservation Found By Its Code', () => __awaiter(void 0, void 0, void 0, function* () {
        const assertReadModel = (_a) => __awaiter(void 0, [_a], void 0, function* ({ connectionString: connStr }) {
            const queryDb = (0, knex_1.default)({ client: 'pg', connection: connStr });
            try {
                const result = yield queryDb('reservation_by_code')
                    .withSchema('public')
                    .where({ code: 'R7K2QX' })
                    .first();
                assert_1.default.ok(result, 'row should exist');
                assert_1.default.strictEqual(result.id, TEST_ID);
                assert_1.default.strictEqual(result.code, 'R7K2QX');
                assert_1.default.strictEqual(result.email, 'guest@example.com');
                assert_1.default.strictEqual(result.party_size, 4);
            }
            finally {
                yield queryDb.destroy();
            }
        });
        yield given([{
                type: 'ReservationPlaced',
                data: {
                    Id: TEST_ID,
                    RestaurantId: '100',
                    Email: 'guest@example.com',
                    Start: '2026-09-18T19:00:00Z',
                    End: '2026-09-18T21:00:00Z',
                    NumberOfPeople: 4,
                    Code: 'R7K2QX',
                },
                metadata: { stream_name: `reservations-${TEST_ID}` },
            }])
            .when([])
            .then(assertReadModel);
    }));
});
