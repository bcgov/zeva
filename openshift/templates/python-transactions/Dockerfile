FROM python:3.7-stretch
ENV PYTHONUNBUFFERED 1
RUN mkdir /app
WORKDIR /app
RUN apt-get update
RUN apt-get install -y git supervisor
ADD requirements.txt .
RUN pip install -r requirements.txt
ADD . .
WORKDIR zeva
CMD alembic upgrade head && python3 service.py
