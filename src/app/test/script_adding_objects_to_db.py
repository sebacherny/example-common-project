import requests
import json
import copy

LOCAL_URL = "http://127.0.0.1:8001"
TEST_USERS = [("testing1", "pass1"), ("testing2", "pass2")]
tokens = []
for username, password in TEST_USERS:
    requests.post(LOCAL_URL + "/api/register/", json={"username": username, "password": password})
    token = json.loads(requests.post(LOCAL_URL + "/api/token/",
                                     json={"username": username, "password": password}).content)["access"]
    tokens.append(token)
    print("Created user {}".format(username))

res = requests.get(LOCAL_URL + "/api/user_info/",
                    headers={"Authorization": "Bearer {}".format(tokens[0])})
