FROM python:3.12.0-slim-bookworm

ENV PYTHONUNBUFFERED=1

WORKDIR /api
COPY requirements.txt /api/
RUN pip install -r requirements.txt
