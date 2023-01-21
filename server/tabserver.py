import ast
import json
import os

import redis
from flask import Flask, request, jsonify, redirect, url_for, jsonify, session, send_from_directory
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

r = redis.Redis(host='127.0.0.1', port=6379, password='')


@app.route("/")
def get_off_my_land():
    return "get off my land"


@app.route("/get_reading_list")
def get_reading_list():
    data = get_item('reading_list')
    return data_response(data)


@app.route("/get_bookmarks")
def get_bookmarks():
    data = get_item('bookmarks')
    return data_response(data)


@app.route("/save_reading_list", methods=["POST"])
def save_reading_list():
    data = request.json
    set_item('reading_list', json.dumps(data))
    return save_response()


@app.route("/save_bookmarks", methods=["POST"])
def save_bookmarks():
    data = request.json
    set_item('bookmarks', json.dumps(data))
    return save_response()


@app.route("/import_reading_list")
def import_reading_list():
    with open('backup_readinglist.json') as f:
        data = json.load(f)
        print(data)
        set_item('reading_list', json.dumps(data))
        return save_response()


@app.route("/import_bookmarks")
def import_bookmarks():
    with open('backup_bookmarks.json') as f:
        data = json.load(f)
        print(data)
        set_item('bookmarks', json.dumps(data))
        return save_response()


def save_response():
    print('return success')
    resp = jsonify(success=True)
    return resp


def data_response(data):
    return jsonify(data) if data else jsonify({'no': 'response'})


def get_item(key):
    result = r.get(key)
    return ast.literal_eval(result.decode()) if result else ""


def set_item(key, value):
    return r.set(key, value.encode())


def flush_all():
    return r.execute_command('FLUSHALL')


@app.errorhandler(Exception)
def handle_error(e):
    print(str(e))


if __name__ == "__main__":
    app.run()