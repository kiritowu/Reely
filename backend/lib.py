import ruamel.yaml
import requests


def read_yaml(path: str):
    yaml = ruamel.yaml.YAML(typ="safe")
    with open(str(path), "r", encoding="utf-8") as f:
        data = yaml.load(f)

    return data


def verify_url_exists(url: str) -> bool:
    try:
        response = requests.head(url, allow_redirects=True, timeout=5)

        if response.status_code >= 400:
            response = requests.get(url, allow_redirects=True, timeout=5)

        if 200 <= response.status_code < 400:
            return True
        else:
            return False

    except requests.exceptions.RequestException as e:
        return False
