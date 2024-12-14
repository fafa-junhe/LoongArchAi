import re

import requests
from bs4 import BeautifulSoup
from model import Model, ModelInfo


class Crawler(Model):
    _INFO = ModelInfo(id='Crawler',
                      name='网络爬虫',
                      params='未知',
                      desc='本地部署网络爬虫',
                      type='W2T')

    @classmethod
    def predict(cls, text):
        response = cls.crawler(text)
        result = cls.parse_page(response)

        return result

    @staticmethod
    def crawler(url):
        headers = {
            'User-Agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36 Edg/125.0.0.0",
        }
        response = requests.get(url, headers=headers, timeout=10)
        soup = BeautifulSoup(response.text)
        return soup


    @staticmethod
    def parse_page(soup):
        texts = []
        def extract_text(element):
            text = element.get_text().strip()
            if text:
                return text.replace('\n', '').replace('\t', '')
            return None

        def process_element(element):
            if element.name == 'a' and element.get('href'):
                href = element['href']
                if not href.startswith('javascript:'):
                    text = extract_text(element)
                    if text:
                        return f"{text} [{href}]"
            else:
                return extract_text(element)
            return None

        tags = ['a', 'p', 'div', 'span', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6']
        for element in soup.find_all(tags)[::2]:
            processed_text = process_element(element)
            if processed_text:
                texts.append(processed_text)

        return '\n'.join(texts)