FROM python:3.9

ENV PYTHONUNBUFFERED=1

WORKDIR /api
COPY requirements.txt /api/
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

