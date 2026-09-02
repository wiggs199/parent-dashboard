import subprocess
import sys
from pathlib import Path

BACKEND_ROOT = Path(__file__).resolve().parent.parent


def test_models_and_migrations_are_in_sync(tmp_path):
    """`alembic check` fails if a model change has no matching migration.

    Runs against a throwaway SQLite file so it never touches real data.
    """
    env = {
        "PATH": __import__("os").environ["PATH"],
        "DATABASE_URL": f"sqlite:///{tmp_path / 'check.db'}",
        "ENV": "development",
    }
    # apply existing migrations, then check for un-generated drift
    up = subprocess.run(
        [sys.executable, "-m", "alembic", "upgrade", "head"],
        cwd=BACKEND_ROOT, env=env, capture_output=True, text=True,
    )
    assert up.returncode == 0, up.stderr

    check = subprocess.run(
        [sys.executable, "-m", "alembic", "check"],
        cwd=BACKEND_ROOT, env=env, capture_output=True, text=True,
    )
    assert check.returncode == 0, (
        "Models changed without a migration. Run:\n"
        "  alembic revision --autogenerate -m \"describe change\"\n\n"
        f"{check.stdout}\n{check.stderr}"
    )
