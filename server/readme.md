virtualenv -p ~/.pyenv/versions/3.6.3/bin/python --no-site-packages py

source py/bin/activate

pip install -r requirements.txt

FLASK_APP=tabserver.py flask run --port=5002