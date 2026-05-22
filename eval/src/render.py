"""Python bridge to the @skill-recorder/render Node CLI.

Why we shell out instead of porting the renderer:
- The Chrome extension and the CRX-side preview both call renderSkillAsMarkdown
  directly. Re-implementing the logic in Python would create two sources of
  truth, and any divergence shows up as noise in the eval ("did the format
  change or did the content change?"). Keeping a single TS renderer behind a
  thin CLI guarantees byte parity (verified by tests/cli-parity.ts).
"""

from __future__ import annotations

import json
import os
import shutil
import subprocess
from pathlib import Path
from typing import Any

# Resolved at import time so failures surface early.
_REPO_ROOT = Path(__file__).resolve().parents[2]
_RENDER_BIN = _REPO_ROOT / "packages" / "skill-render" / "dist" / "cli.js"


class RendererMissingError(RuntimeError):
    pass


class RendererFailureError(RuntimeError):
    def __init__(self, exit_code: int, stderr: str):
        super().__init__(f"renderer exited with {exit_code}: {stderr}")
        self.exit_code = exit_code
        self.stderr = stderr


def ensure_built() -> Path:
    """Verify the CLI exists. Caller can `raise` or rebuild on failure."""
    if not _RENDER_BIN.exists():
        raise RendererMissingError(
            f"renderer not built: {_RENDER_BIN}\n"
            "from the repo root: pnpm --filter @skill-recorder/render build"
        )
    if shutil.which("node") is None:
        raise RendererMissingError("node not on PATH — install Node 20+ to use the renderer CLI")
    return _RENDER_BIN


def render_skill(skill: dict[str, Any]) -> str:
    """Render a Skill dict to Markdown via the Node CLI.

    Raises RendererMissingError if the CLI binary or `node` is unavailable.
    Raises RendererFailureError if the CLI exits non-zero (schema / render errors).
    """
    bin_path = ensure_built()
    proc = subprocess.run(
        ["node", str(bin_path), "render"],
        input=json.dumps(skill).encode("utf-8"),
        capture_output=True,
        check=False,
    )
    if proc.returncode != 0:
        raise RendererFailureError(proc.returncode, proc.stderr.decode("utf-8", errors="replace"))
    return proc.stdout.decode("utf-8")


def renderer_version() -> str:
    """Return `skill-render --version` output (used by runner.py to stamp runs.csv)."""
    # Allow override via env var so eval can pin a specific build for reproducibility.
    pinned = os.environ.get("SKILL_RENDER_VERSION")
    if pinned:
        return pinned
    bin_path = ensure_built()
    proc = subprocess.run(
        ["node", str(bin_path), "--version"],
        capture_output=True,
        check=True,
    )
    return proc.stdout.decode("utf-8").strip()
