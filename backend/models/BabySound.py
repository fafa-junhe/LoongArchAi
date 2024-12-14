import pickle
import numpy as np
from model import Model, ModelInfo
import base64
import io
import soundfile as sf
from scipy.fftpack import dct
from scipy.signal import spectrogram


class BabySound(Model):
    _INFO = ModelInfo(
        id='BabySound',
        name='哭声检测',
        params='未知',
        desc='小孩子哭声检测',
        type='BabySound',
    )
    model = None

    @staticmethod
    def wav2mfcc(audio_array, sample_rate):
        # Normalize the audio array
        audio_array = (audio_array - np.mean(audio_array)) / np.std(audio_array)
        
        # Compute the spectrogram
        f, t, Sxx = spectrogram(audio_array, fs=sample_rate, nperseg=400, noverlap=240)
        
        # Compute the log of the power spectrum
        log_Sxx = np.log(Sxx + 1e-10)
        
        # Apply the Discrete Cosine Transform (DCT) to get MFCCs
        mfccs = dct(log_Sxx, type=2, axis=0, norm='ortho')[:128]
        
        # Compute the mean of the MFCCs
        m = np.mean(mfccs, axis=1)
        
        return m

    @staticmethod
    def base64_to_wav(base64_data):
        # Decode base64 data
        decoded_data = base64.b64decode(base64_data)

        # Read the binary data as an audio array
        audio_io = io.BytesIO(decoded_data)
        audio_array, sample_rate = sf.read(audio_io)

        # Return the audio array and sample rate
        return audio_array, sample_rate

    @classmethod
    def predict(cls, text):
        if not cls.model:
            model_path = 'weights/sounds_model.pkl'
            with open(model_path, 'rb') as f:
                cls.model = pickle.loads(f.read())
        wav, sr = cls.base64_to_wav(text)  # 获取音频数组和采样率
        m = cls.wav2mfcc(wav, sr)  # 传递两个参数
        return cls.model.predict(np.array([m]))


    
