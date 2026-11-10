import sherpa_onnx, numpy as np, soundfile as sf, os
M = os.path.join(os.path.dirname(__file__), '..', 'models')
def make(voice):
    if voice == 'kokoro':
        d = f'{M}/kokoro-multi-lang-v1_0'
        mc = sherpa_onnx.OfflineTtsModelConfig(kokoro=sherpa_onnx.OfflineTtsKokoroModelConfig(
            model=f'{d}/model.onnx', voices=f'{d}/voices.bin', tokens=f'{d}/tokens.txt',
            data_dir=f'{d}/espeak-ng-data', lang='fr'), num_threads=4)
        sid = 30
    else:
        d = f'{M}/vits-piper-fr_FR-{voice}-medium'
        mc = sherpa_onnx.OfflineTtsModelConfig(vits=sherpa_onnx.OfflineTtsVitsModelConfig(
            model=f'{d}/fr_FR-{voice}-medium.onnx', tokens=f'{d}/tokens.txt', data_dir=f'{d}/espeak-ng-data'), num_threads=4)
        sid = 0
    tts = sherpa_onnx.OfflineTts(sherpa_onnx.OfflineTtsConfig(model=mc, max_num_sentences=1))
    return tts, sid
_rec = None
def asr(samples, sr):
    global _rec
    if _rec is None:
        d = f'{M}/sherpa-onnx-whisper-small'
        _rec = sherpa_onnx.OfflineRecognizer.from_whisper(encoder=f'{d}/small-encoder.int8.onnx', decoder=f'{d}/small-decoder.int8.onnx', tokens=f'{d}/small-tokens.txt', language='fr', task='transcribe', num_threads=4)
    s = _rec.create_stream(); s.accept_waveform(sr, samples); _rec.decode_stream(s); return s.result.text
