FROM python:3.7-stretch
ENV PYTHONUNBUFFERED 1
RUN mkdir /app
WORKDIR /app
ADD requirements.txt .
RUN pip install -r requirements.txt
ADD . .
CMD python3 manage.py migrate && python3 manage.py runserver 0.0.0.0:10102
