---
pubDatetime: 2021-03-27T11:15:40Z
modDatetime: 2022-11-22T12:07:42Z
title: "Multistage Python Container"
tags:
  - "Docker"
  - "python"
description: "When building a python container, I ended up with a huge 450MB image just because I needed it to have psycopg2 . Time to chop it down using a multistage bu"
---
When building a python container, I ended up with a huge 450MB image just because I needed it to have [`psycopg2`](https://www.psycopg.org). Time to chop it down using a multistage build. This technique can be applied to any python module that needs building, too.

```
FROM python:3-alpine as base

LABEL SPDX-License-Identifier="AGPL-3.0-or-later"

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

FROM base as builder

RUN apk add --no-cache \
    gcc \
    musl-dev \
    postgresql-dev \
    python3-dev

RUN mkdir /install && \
    pip3 install --prefix=/install \
    psycopg2 \
    python-dotenv 
    
FROM base

RUN apk add --no-cache libpq

COPY --from=builder /install /usr/local

COPY ./myapp.py /myapp.py

CMD [ "python", "/myapp.py"]
```

Because `pyscopg2` requires building before it can be used we need to install `gcc` and development tools to compile it. But once compiled, we don't need to keep the tools we needed to build it.

By using `pip3 install --prefix=/install` we ensure that our python libraries get installed in a single location we can use to copy from. I then include all the libraries I need for my python project.

Using a multistage build we build and install `psycopg2` in a builder container, then make a second container, copy from the builder stage container the built items, and then dispose of the builder container. This leaves us with a tidy 45MB image instead of the 450MB one that includes the build tools.

When running the container, I noticed I wasn't getting any output from my `print()` functions that I'd expect to see in the docker logs for stdout. You need to run python unbuffered to get the output to flow - hence the environment variable `PYTHONUNBUFFERED=1`.

As we build the final container, we need to include [`libpq`](https://www.postgresql.org/docs/12/libpq.html) - is the C application programmer's interface to PostgreSQL.

## References

[https://github.com/psycopg/psycopg2/issues/684#issuecomment-453803835](https://github.com/psycopg/psycopg2/issues/684#issuecomment-453803835)

[https://www.rockyourcode.com/install-psycopg2-binary-with-docker/](https://www.rockyourcode.com/install-psycopg2-binary-with-docker/)

[https://stackoverflow.com/questions/51362213/docker-compose-not-printing-stdout-in-python-app](https://stackoverflow.com/questions/51362213/docker-compose-not-printing-stdout-in-python-app)
