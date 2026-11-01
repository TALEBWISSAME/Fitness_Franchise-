import contextlib
import io
import json
import unittest
from unittest.mock import patch
from urllib.request import Request

from simulator import treadmill_simulator as simulator


class FakeResponse:
    status = 200

    def __init__(self, value):
        self.content = json.dumps(value).encode("utf-8")

    def __enter__(self):
        return self

    def __exit__(self, *_):
        return False

    def read(self):
        return self.content


class FakeOpener:
    def __init__(self, response):
        self.response = response
        self.requests = []

    def open(self, request, timeout):
        self.requests.append((request, timeout))
        return self.response


class TreadmillSimulatorTests(unittest.TestCase):
    def test_simulation_keeps_duration_speed_and_distance_calculation(self):
        with patch.object(simulator.random, "randint", return_value=15), \
                patch.object(simulator.random, "uniform", return_value=6.0), \
                patch.object(simulator.time, "sleep") as sleep, \
                contextlib.redirect_stdout(io.StringIO()):
            activity = simulator.generer_activite()

        self.assertEqual(activity["equipmentType"], "TREADMILL")
        self.assertEqual(activity["durationMinutes"], 15)
        self.assertEqual(activity["distanceKm"], 1.5)
        self.assertEqual(len(activity["date"]), 19)
        self.assertEqual(sleep.call_count, 3)

    def test_catalog_lookup_matches_exact_type_and_uses_its_id(self):
        opener = FakeOpener(FakeResponse([
            {"id": 9, "type": "TREADMILL"},
            {"id": 12, "type": "ROWING"},
            {"id": 13, "type": "treadmill"},
        ]))

        equipment_id = simulator.obtenir_id_tapis(opener)

        self.assertEqual(equipment_id, 9)
        request, timeout = opener.requests[0]
        self.assertEqual(request.full_url, simulator.EQUIPMENTS_URL)
        self.assertEqual(request.get_method(), "GET")
        self.assertEqual(timeout, simulator.REQUEST_TIMEOUT)

    def test_missing_or_malformed_treadmill_prevents_equipment_resolution(self):
        for catalog in (
            [{"id": 1, "type": "ROWING"}],
            [{"id": "1", "type": "TREADMILL"}],
            [{"id": True, "type": "TREADMILL"}],
            {"id": 1, "type": "TREADMILL"},
        ):
            with self.subTest(catalog=catalog):
                with self.assertRaises(RuntimeError):
                    simulator.obtenir_id_tapis(FakeOpener(FakeResponse(catalog)))

    def test_prepared_payload_includes_equipment_id_and_legacy_type(self):
        activity = {
            "equipmentType": "TREADMILL",
            "durationMinutes": 20,
            "distanceKm": 3.2,
            "date": "2026-11-01T15:00:00",
        }

        payload = simulator.preparer_activite(activity, 23)

        self.assertEqual(payload["equipmentId"], 23)
        self.assertEqual(payload["equipmentType"], "TREADMILL")
        self.assertEqual(payload["distanceKm"], 3.2)
        with self.assertRaises(RuntimeError):
            simulator.preparer_activite(activity, 0)

    def test_post_sends_catalog_id_but_never_prints_payload_or_csrf_token(self):
        opener = FakeOpener(FakeResponse({"status": "ACCEPTED"}))
        activity = {
            "equipmentId": 23,
            "equipmentType": "TREADMILL",
            "durationMinutes": 20,
            "distanceKm": 3.2,
            "date": "2026-11-01T15:00:00",
        }
        output = io.StringIO()

        with patch.object(simulator, "obtenir_csrf", return_value=("X-CSRF-TOKEN", "csrf-secret")), \
                contextlib.redirect_stdout(output):
            simulator.envoyer_activite(opener, activity)

        request, timeout = opener.requests[0]
        self.assertEqual(request.full_url, simulator.ACTIVITIES_URL)
        self.assertEqual(request.get_method(), "POST")
        self.assertEqual(json.loads(request.data), activity)
        self.assertEqual(request.get_header("X-csrf-token"), "csrf-secret")
        self.assertEqual(timeout, simulator.REQUEST_TIMEOUT)
        self.assertNotIn("csrf-secret", output.getvalue())
        self.assertNotIn('"equipmentId": 23', output.getvalue())
        self.assertNotIn("3.2", output.getvalue())

    def test_missing_treadmill_stops_before_generation_or_post(self):
        with patch.object(simulator, "identifiants_compte", return_value=("member@example.test", "secret")), \
                patch.object(simulator, "build_opener", return_value=object()), \
                patch.object(simulator, "se_connecter") as login, \
                patch.object(simulator, "obtenir_id_tapis", side_effect=RuntimeError("Tapis introuvable")), \
                patch.object(simulator, "generer_activite") as generate, \
                patch.object(simulator, "envoyer_activite") as send, \
                contextlib.redirect_stdout(io.StringIO()):
            with self.assertRaisesRegex(RuntimeError, "Tapis introuvable"):
                simulator.main()

        login.assert_called_once()
        generate.assert_not_called()
        send.assert_not_called()

    def test_main_sends_resolved_equipment_id_without_logging_credentials_or_id(self):
        generated = {
            "equipmentType": "TREADMILL",
            "durationMinutes": 20,
            "distanceKm": 3.2,
            "date": "2026-11-01T15:00:00",
        }
        opener = object()
        output = io.StringIO()
        with patch.object(simulator, "identifiants_compte", return_value=("private@example.test", "secret-password")), \
                patch.object(simulator, "build_opener", return_value=opener), \
                patch.object(simulator, "se_connecter") as login, \
                patch.object(simulator, "obtenir_id_tapis", return_value=23), \
                patch.object(simulator, "generer_activite", return_value=generated), \
                patch.object(simulator, "envoyer_activite") as send, \
                contextlib.redirect_stdout(output):
            simulator.main()

        login.assert_called_once()
        send.assert_called_once_with(opener, {
            **generated,
            "equipmentId": 23,
            "equipmentType": "TREADMILL",
        })
        self.assertNotIn("private@example.test", output.getvalue())
        self.assertNotIn("secret-password", output.getvalue())
        self.assertNotIn("23", output.getvalue())


if __name__ == "__main__":
    unittest.main()
