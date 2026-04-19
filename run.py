#!/usr/bin/env python3
"""Legacy launcher kept for `python3 run.py` compatibility. Delegates to
`app.__main__.main`, which is also the target of the `job-tracker` console
script defined in `pyproject.toml`."""

from app.__main__ import main

if __name__ == "__main__":
    main()
