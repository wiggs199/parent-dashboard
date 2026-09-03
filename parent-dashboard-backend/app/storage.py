"""Document blob storage.

Cloudflare R2 (S3-compatible) when configured; a local ./uploads folder
otherwise, so dev and tests never touch the network.
"""
import shutil
from functools import lru_cache
from pathlib import Path
from typing import BinaryIO, Iterator, Optional

from app.config import (
    R2_ACCESS_KEY_ID,
    R2_BUCKET,
    R2_ENDPOINT,
    R2_SECRET_ACCESS_KEY,
)

_LOCAL_DIR = Path("uploads")


def using_r2() -> bool:
    return all([R2_ENDPOINT, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET])


@lru_cache(maxsize=1)
def _client():
    import boto3  # imported lazily so the local path needs no boto3

    return boto3.client(
        "s3",
        endpoint_url=R2_ENDPOINT,
        aws_access_key_id=R2_ACCESS_KEY_ID,
        aws_secret_access_key=R2_SECRET_ACCESS_KEY,
        region_name="auto",
    )


def put(key: str, fileobj: BinaryIO, content_type: Optional[str] = None) -> None:
    if using_r2():
        extra = {"ContentType": content_type} if content_type else {}
        _client().upload_fileobj(fileobj, R2_BUCKET, key, ExtraArgs=extra or None)
    else:
        dest = _LOCAL_DIR / key
        dest.parent.mkdir(parents=True, exist_ok=True)
        with open(dest, "wb") as f:
            shutil.copyfileobj(fileobj, f)


def open_stream(key: str) -> Iterator[bytes]:
    if using_r2():
        body = _client().get_object(Bucket=R2_BUCKET, Key=key)["Body"]
        for chunk in body.iter_chunks(8192):
            yield chunk
    else:
        with open(_LOCAL_DIR / key, "rb") as f:
            while True:
                chunk = f.read(8192)
                if not chunk:
                    break
                yield chunk


def delete(key: str) -> None:
    if using_r2():
        _client().delete_object(Bucket=R2_BUCKET, Key=key)
    else:
        p = _LOCAL_DIR / key
        if p.exists():
            p.unlink()
