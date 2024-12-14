import json
import numpy as np
import onnxruntime
import os

from model import Model, ModelInfo

class HexUtils:
    @staticmethod
    def chars_to_hex(chars):
        return "".join([f"{ord(char):02x}" for char in chars])

class WorldTokenizerImp:
    VOCAB_NAME = "vocab.json"

    def __init__(self):
        self.encoder, self.decoder, self.tiesSet = {}, {}, set()
        self.fill_decoder()
        self.fill_encoder()

    def encode(self, text):
        result, chars, position, start = [], list(text), 0, 0
        while position <= len(chars):
            if HexUtils.chars_to_hex(chars[start:position]) not in self.tiesSet or position == len(chars):
                while position > start:
                    word = ''.join(chars[start:position])
                    if word in self.encoder:
                        result.append(self.encoder[word])
                        start = position
                        break
                    position -= 1
                else:
                    start += 1
                    position = start
            position += 1
        return result

    def fill_decoder(self):
        with open(os.path.join("./weights/", self.VOCAB_NAME), 'r', encoding="utf-8") as file:
            data = json.load(file)
            for key, value in data.items():
                self.tiesSet.update(HexUtils.chars_to_hex(value[:i]) for i in range(1, len(value) + 1))
                self.decoder[int(key)] = value

    def fill_encoder(self):
        self.encoder = {v: k for k, v in self.decoder.items()}

class ChatRWKV(Model):
    _INFO = ModelInfo(id='ChatRWKV',
                      name='RWKVv4(本地模型)',
                      params='0.4B',
                      desc='本地部署大语言模型',
                      type='T2T')
    session = None
    vocab = json.load(open("./weights/vocab.json", encoding="utf-8"))
    options = onnxruntime.SessionOptions()
    options.graph_optimization_level = onnxruntime.GraphOptimizationLevel.ORT_ENABLE_EXTENDED
    layer, embd, input_names, map = 24, 1024, None, {}
    tokenizer, occurrence = WorldTokenizerImp(), {}

    @classmethod
    def initialize_session(cls):
        import onnxruntime
        if cls.session is None:
            available_providers = onnxruntime.get_available_providers()
            provider = 'CPUExecutionProvider' if 'CPUExecutionProvider' in available_providers else 'CUDAExecutionProvider'
            cls.session = onnxruntime.InferenceSession("./weights/model.onnx", providers=[provider],
                                                       sess_options=cls.options)
            cls.input_names = [i.name for i in cls.session.get_inputs()]
            buffer_shape = (cls.layer, cls.embd)
            cls.map = {
                name: np.full(buffer_shape, -1e30, dtype=np.float32) if name == "pp_att" else np.zeros(buffer_shape,
                                                                                                       dtype=np.float32)
                for name in cls.input_names}

    @classmethod
    def generate(cls, arrays, max_count):
        cls.initialize_session()
        next_token = 0
        size = max_count + len(arrays)
        for _ in range(size):
            if arrays:
                next_token = arrays.pop(0)
            cls.map["idx"] = np.array([next_token])
            ort = cls.session.run(None, cls.map)
            output_logits = ort[0]
            for token, value in cls.occurrence.items():
                output_logits[token] -= (0.7 + value * 0.4)
            next_token = cls.sample(output_logits, 1, 0.2)
            cls.occurrence[next_token] = cls.occurrence.get(next_token, 0) + 1
            if not arrays:
                if next_token in [60807, 23692, 33161, 82, 24281, 53648, 40301]:
                    break
                yield cls.vocab.get(str(next_token), "[Error]")
            cls.map = {name: ort[x] for x, name in enumerate(cls.input_names)}

    @classmethod
    def sample(cls, logits, temperature, top_p):
        probs = np.exp(logits - np.max(logits)) / np.exp(logits - np.max(logits)).sum()
        sorted_probs = probs[np.argsort(probs)[::-1]]
        probs[probs < sorted_probs[np.argmax(np.cumsum(sorted_probs) > top_p)]] = 0
        if temperature != 1:
            probs **= 1.0 / temperature
        return np.random.choice(np.arange(len(probs)), p=probs / probs.sum())

    @classmethod
    def predict(cls, data):
        cls.initialize_session()
        chat_input = [11, 261, 53648, 59] + cls.tokenizer.encode(data["text"]) + [261, 40301, 59]
        return "".join(cls.generate(chat_input, 9000)).strip()

    @classmethod
    def stream_predict(cls, data):
        cls.initialize_session()
        chat_input = [11, 261, 53648, 59] + cls.tokenizer.encode(data["text"][-1]["content"]) + [261, 40301, 59]
        
        message = ""
        for text in cls.generate(chat_input, 9000):
            message += text
            yield message