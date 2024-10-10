FROM --platform=linux/amd64 python:3.9

ENV PYTHONUNBUFFERED=1

WORKDIR /api
COPY requirements.txt /api/
RUN pip install --upgrade pip==24.0
RUN pip install -r requirements.txt
