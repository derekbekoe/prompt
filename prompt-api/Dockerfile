FROM python:3.5

RUN pip install docker==2.5.1
RUN pip install gunicorn
RUN pip install Flask
RUN pip install flask-cors

ADD app.py /
ENV FLASK_APP app.py

CMD gunicorn -w 10 -b 0.0.0.0:5000 app:app
