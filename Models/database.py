import os
from contextlib import contextmanager
from typing import Iterator

import psycopg
from psycopg.rows import dict_row

DATABASE_URL = os.getenv('DATABASE_URL')

@contextmanager
def get_connection() -> Iterator[psycopg.Connection]:
    if not DATABASE_URL:
        raise RuntimeError('DATABASE_URL is not configured')
    connection = psycopg.connect(DATABASE_URL, row_factory=dict_row)
    try:
        yield connection
    finally:
        connection.close()
