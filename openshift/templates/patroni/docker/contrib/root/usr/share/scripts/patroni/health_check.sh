#!/usr/bin/env bash
set -Eeu
set -o pipefail

<<<<<<< HEAD
pg_isready -q && patronictl list --format=json | jq -e ".[] | select(.Member == \"$(hostname)\" and .State == \"running\" and .\"Lag in MB\" == 0)"
=======
pg_isready -q && patronictl list --format=json | jq -e ".[] | select(.Member == \"$(hostname)\" and .State == \"running\")"
>>>>>>> upstream/release-sprint-8
