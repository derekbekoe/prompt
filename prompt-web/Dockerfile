FROM python:3.6

RUN pip install gunicorn Flask flask-cors requests pymongo adal
RUN pip install azure-mgmt-containerinstance==0.1.0 azure-mgmt-dns==1.1.0
ADD app.py /
ADD templates /templates
ADD static /static
ENV FLASK_APP app.py

CMD gunicorn -w 10 -b 0.0.0.0:80 app:app
