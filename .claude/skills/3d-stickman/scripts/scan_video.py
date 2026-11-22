#!/usr/bin/env python3
"""
scan_video.py - let a chat assistant "watch" a short video from inside a Python sandbox.

  1. Reads duration, fps, resolution, rotation and whether there is an audio track.
  2. Decodes a small analysis stream (at most 15 fps, 96 px) and finds hard cuts with a
     colour-histogram + pixel-difference score compared against an adaptive local
     baseline (fast motion raises the baseline, so it is not mistaken for a cut;
     one-frame flashes are rejected; same-layout changes are flagged "low").
     Dissolves / fades / whip pans are listed separately as "soft" transitions.
  3. Samples frames every ~0.5 s (clips up to 15 s), ~1 s (up to 60 s), coarser beyond.
  4. Writes timestamp-labelled JPEG contact sheets the assistant can open and look at:
        timeline_NN.jpg  every sampled moment in order (red CUT tag = a new shot began)
        shots_NN.jpg     one larger frame per detected shot (count people here)
        cuts_NN.jpg      the frames either side of each cut (confirm or reject cuts here)
        soft_NN.jpg      four frames across each possible dissolve / wipe / whip pan
        scan.json        every number above, plus generation segments (up to --max-seg s)
  5. Prints prompt helpers: the cuts rounded to whole-second beats ([0s-4s] [4s-10s]), the same
     with soft transitions and black gaps, per-segment local beats, and the 8n+1 frame trim some
     edit modes need to keep the exact length.
     Optional --grab writes full-resolution stills (e.g. first/last frame of each segment).
Decoders, first one available wins: ffmpeg CLI -> imageio-ffmpeg -> OpenCV -> PyAV.
Hard requirement: Pillow. Python 3.8+.

  python3 scan_video.py --check                       # which decoders does this sandbox have?
  python3 scan_video.py clip.mp4
  python3 scan_video.py clip.mp4 --out /mnt/data/scan --max-seg 10 --grab segments
  python3 scan_video.py clip.mp4 --skip ffmpeg        # behave as if the ffmpeg CLI were missing
  python3 scan_video.py clip.mp4 --backend opencv     # force one decoder
"""
from __future__ import annotations

import argparse
import json
import math
import os
import re
import shutil
import statistics
import struct
import subprocess
import sys
import threading
import time

try:
    from PIL import Image, ImageChops, ImageDraw, ImageFilter, ImageFont, ImageStat
    _RS = getattr(Image, "Resampling", Image)
    _TR = getattr(Image, "Transpose", Image)
    LANCZOS, NEAREST = _RS.LANCZOS, _RS.NEAREST
    ROTATE_CW = {90: _TR.ROTATE_270, 180: _TR.ROTATE_180, 270: _TR.ROTATE_90}
except Exception:  # Pillow missing -> metadata only, see main()
    Image = None

BACKENDS = ["ffmpeg", "imageio-ffmpeg", "opencv", "pyav"]
EXE = ".exe" if os.name == "nt" else ""
ANALYSIS_LONG = 96          # px, long side of the frames used for cut detection
FONT_FILES = [
    "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
    "/usr/share/fonts/dejavu/DejaVuSans-Bold.ttf",
    "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
    "/usr/share/fonts/truetype/freefont/FreeSansBold.ttf",
    "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
    "/Library/Fonts/Arial Bold.ttf",
    "/System/Library/Fonts/Helvetica.ttc",
    "C:/Windows/Fonts/arialbd.ttf",
    "DejaVuSans-Bold.ttf",
    "Arial Bold.ttf",
]


# --------------------------------------------------------------------------- helpers
def log(*a):
    print(*a, file=sys.stderr, flush=True)


def num(x):
    """float(x) or None. Accepts '30000/1001', Fraction, '0/0'."""
    try:
        if isinstance(x, str) and "/" in x:
            a, b = x.split("/", 1)
            return float(a) / float(b) if float(b) else None
        v = float(x)
        return v if math.isfinite(v) else None
    except (TypeError, ValueError, ZeroDivisionError):
        return None


def fmt_ts(t, dec=1):
    """Seconds -> M:SS.s, the format printed on the tiles."""
    t = round(max(0.0, float(t)), dec)
    m = int(t // 60)
    return "%d:%0*.*f" % (m, 3 + dec if dec else 2, dec, t - 60 * m)


def run(cmd, timeout=180):
    try:
        p = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE,
                           stdin=subprocess.DEVNULL, timeout=timeout)
        return p.returncode, p.stdout.decode("utf-8", "replace"), p.stderr.decode("utf-8", "replace")
    except (OSError, subprocess.SubprocessError) as e:
        return -1, "", str(e)


def read_exact(f, n):
    chunks, got = [], 0
    while n > got:
        b = f.read(n - got)
        if not b:
            return None
        chunks.append(b)
        got += len(b)
    return b"".join(chunks)


def resample(stream, fps_a):
    """Map a (time, frame) stream onto the grid k / fps_a, nearest frame per tick
    (what ffmpeg's fps filter does for the CLI backends)."""
    step, k, prev, t0 = 1.0 / fps_a, 0, None, None
    for t, fr in stream:
        if t0 is None:
            t0 = t
        t -= t0
        while t + 1e-9 >= k * step:
            tick = k * step
            yield k, (prev[1] if prev is not None and t - tick > tick - prev[0] else fr)
            k += 1
        prev = (t, fr)


# ------------------------------------------------------------ MP4/MOV header (no deps)
def mp4_probe(path):
    """Pure-Python ISO-BMFF (mp4/mov/m4v/3gp) reader. Never decodes; {} if not MP4/MOV."""
    info, tracks = {}, []
    try:
        f = open(path, "rb")
    except OSError:
        return info
    with f:
        size_of_file = os.fstat(f.fileno()).st_size

        def read(pos, n):
            f.seek(pos)
            return f.read(n)

        def boxes(start, end):
            pos = start
            while end >= pos + 8:
                size, kind = struct.unpack(">I4s", read(pos, 8))
                head = 8
                if size == 1:
                    size, head = struct.unpack(">Q", read(pos + 8, 8))[0], 16
                elif size == 0:
                    size = end - pos
                if head > size:
                    return
                yield kind.decode("latin-1"), pos + head, min(pos + size, end)
                pos += size

        def child(start, end, *names):
            for kind, s, e in boxes(start, end):
                if kind == names[0]:
                    return (s, e) if len(names) == 1 else child(s, e, *names[1:])
            return None

        def timing(box):  # mvhd / mdhd -> seconds
            v1 = read(box[0], 1)[0] == 1
            ts, dur = struct.unpack(">IQ" if v1 else ">II", read(box[0] + (20 if v1 else 12), 12 if v1 else 8))
            return dur / ts if ts else None

        moov = child(0, size_of_file, "moov")
        if not moov:
            return info
        mvhd = child(moov[0], moov[1], "mvhd")
        if mvhd:
            info["duration"] = timing(mvhd)
        for kind, s, e in boxes(*moov):
            if kind != "trak":
                continue
            t = {}
            hdlr = child(s, e, "mdia", "hdlr")
            if hdlr:
                t["type"] = read(hdlr[0] + 8, 4).decode("latin-1")
            mdhd = child(s, e, "mdia", "mdhd")
            if mdhd:
                t["duration"] = timing(mdhd)
            tkhd = child(s, e, "tkhd")
            if tkhd:
                mpos = tkhd[0] + (52 if read(tkhd[0], 1)[0] == 1 else 40)
                m = struct.unpack(">9i", read(mpos, 36))
                if m[0] or m[1]:
                    t["rotation_cw"] = int(round(math.degrees(math.atan2(m[1], m[0])))) % 360
                w, h = struct.unpack(">II", read(mpos + 36, 8))
                t["width"], t["height"] = int(round(w / 65536.0)), int(round(h / 65536.0))
            stts = child(s, e, "mdia", "minf", "stbl", "stts")
            if stts:
                n = struct.unpack(">I", read(stts[0] + 4, 4))[0]
                data = read(stts[0] + 8, 8 * min(n, 200000))
                runs = [struct.unpack_from(">II", data, 8 * i) for i in range(len(data) // 8)]
                total = sum(c for c, _ in runs)
                t["samples"] = total
                if total:
                    per_delta = {}
                    for c, d in runs:
                        per_delta[d] = per_delta.get(d, 0) + c
                    t["vfr"] = 0.95 * total > max(per_delta.values())
            stsd = child(s, e, "mdia", "minf", "stbl", "stsd")
            if stsd:
                t["codec"] = read(stsd[0] + 12, 4).decode("latin-1").strip()
            tracks.append(t)
    vids = [t for t in tracks if t.get("type") == "vide"]
    auds = [t for t in tracks if t.get("type") == "soun"]
    info["has_audio"] = bool(auds)
    if auds:
        info["audio_codec"] = auds[0].get("codec")
    if vids:
        v = vids[0]
        info.update({k: v[k] for k in ("width", "height", "rotation_cw", "vfr") if k in v})
        info["video_codec"] = v.get("codec")
        info["video_duration"] = v.get("duration")
        info["frames"] = v.get("samples")
        if v.get("duration") and v.get("samples"):
            info["fps"] = v["samples"] / v["duration"]
    return info


# ------------------------------------------------------------------- ffmpeg probing
STREAM_RE = re.compile(r"^\s*Stream #\d+:\d+\S*:\s*(Video|Audio|Subtitle|Data|Attachment):\s*(.*)$")


def probe_ffprobe(ffprobe, path):
    rc, out, err = run([ffprobe, "-v", "error", "-print_format", "json",
                        "-show_format", "-show_streams", path])
    if rc != 0 or not out.strip():
        raise RuntimeError("ffprobe failed: " + (err.strip().splitlines() or ["?"])[-1])
    j = json.loads(out)
    streams = j.get("streams") or []
    vstreams = [s for s in streams if s.get("codec_type") == "video"]
    vids = [s for s in vstreams if not (s.get("disposition") or {}).get("attached_pic")]
    if not vids:
        raise RuntimeError("no video stream in the file")
    v, fmt = vids[0], j.get("format") or {}
    rot = 0.0
    for sd in v.get("side_data_list") or []:
        if num(sd.get("rotation")) is not None:
            rot = -num(sd["rotation"])
    if not rot and num((v.get("tags") or {}).get("rotate")):
        rot = num(v["tags"]["rotate"])
    auds = [s for s in streams if s.get("codec_type") == "audio"]
    audio = {"present": bool(auds)}
    if auds:
        audio.update(codec=auds[0].get("codec_name"), sample_rate=num(auds[0].get("sample_rate")),
                     channels=auds[0].get("channel_layout") or auds[0].get("channels"))
    nbf = str(v.get("nb_frames", ""))
    return {
        "vindex": vstreams.index(v), "duration": num(fmt.get("duration")),
        "video_duration": num(v.get("duration")), "start_time": num(fmt.get("start_time")),
        "width": v.get("width"), "height": v.get("height"),
        "sar": num((v.get("sample_aspect_ratio") or "1:1").replace(":", "/")) or 1.0,
        "fps": num(v.get("avg_frame_rate")) or num(v.get("r_frame_rate")),
        "frames": int(nbf) if nbf.isdigit() else None, "vcodec": v.get("codec_name"),
        "rotation_cw": int(round(rot)) % 360, "audio": audio, "probe": "ffprobe",
    }


def probe_header(exe, path):
    """No ffprobe: parse the stream summary that `ffmpeg -i` prints."""
    rc, out, text = run([exe, "-hide_banner", "-nostdin", "-i", path], timeout=60)
    if "Input #0" not in text:
        raise RuntimeError("ffmpeg cannot read the file: " + (text.strip().splitlines() or ["?"])[-1])
    lines = text.splitlines()
    info = {"audio": {"present": False}, "probe": "ffmpeg -i", "rotation_cw": 0, "sar": 1.0}
    m = re.search(r"Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)", text)
    if m:
        info["duration"] = int(m.group(1)) * 3600 + int(m.group(2)) * 60 + float(m.group(3))
    m = re.search(r"start:\s*(-?\d+(?:\.\d+)?)", text)
    if m:
        info["start_time"] = float(m.group(1))
    nvid = 0
    for i, line in enumerate(lines):
        sm = STREAM_RE.match(line)
        if not sm:
            continue
        kind, rest = sm.groups()
        if kind == "Video":
            idx, nvid = nvid, nvid + 1
            if "vcodec" in info or "attached pic" in rest:
                continue
            info["vindex"], info["vcodec"] = idx, rest.split()[0].strip(",")
            m = re.search(r"\b(\d{2,5})x(\d{2,5})\b", rest)
            if m:
                info["width"], info["height"] = int(m.group(1)), int(m.group(2))
            m = re.search(r"SAR (\d+):(\d+)", rest)
            if m and int(m.group(1)) and int(m.group(2)):
                info["sar"] = int(m.group(1)) / int(m.group(2))
            m = re.search(r"([\d.]+) fps", rest) or re.search(r"([\d.]+) tbr", rest)
            if m:
                info["fps"] = float(m.group(1))
            block = []
            for l2 in lines[i + 1:]:
                if STREAM_RE.match(l2) or not l2.startswith("    "):
                    break
                block.append(l2)
            blk = "\n".join(block)
            r = re.search(r"rotation of (-?[\d.]+) degrees", blk)
            r2 = re.search(r"rotate\s*:\s*(-?\d+)", blk)
            if r:
                info["rotation_cw"] = int(round(-float(r.group(1)))) % 360
            elif r2:
                info["rotation_cw"] = int(r2.group(1)) % 360
        elif kind == "Audio" and not info["audio"]["present"]:
            a = {"present": True, "codec": rest.split()[0].strip(",")}
            m = re.search(r"(\d+) Hz,\s*([^,]+)", rest)
            if m:
                a["sample_rate"], a["channels"] = int(m.group(1)), m.group(2).strip()
            info["audio"] = a
    if "vcodec" not in info:
        raise RuntimeError("no video stream in the file")
    return info


# ------------------------------------------------------------------------- backends
class Unavailable(Exception):
    pass


def find_ffmpeg(explicit=None):
    home = os.path.expanduser("~")
    cands = [explicit, os.environ.get("FFMPEG_BINARY"), shutil.which("ffmpeg"),
             os.path.join(home, ".local", "bin", "ffmpeg"), "/usr/bin/ffmpeg", "/usr/local/bin/ffmpeg",
             "/opt/homebrew/bin/ffmpeg", "/opt/conda/bin/ffmpeg"]
    for c in cands:
        if c and os.path.isfile(c) and os.access(c, os.X_OK) and run([c, "-version"], 20)[0] == 0:
            return c
    return None


class FFmpegBackend:
    """ffmpeg CLI: decode, auto-rotate and resample inside ffmpeg; raw RGB frames over a pipe."""
    name = "ffmpeg"
    sync = ["-fps_mode", "passthrough"]  # ffmpeg >= 5.1; older builds get "-vsync 0"

    def __init__(self, exe=None):
        self.exe = exe or find_ffmpeg()
        if not self.exe:
            raise Unavailable("no ffmpeg executable on PATH or in common locations")
        probe = os.path.join(os.path.dirname(self.exe), "ffprobe" + EXE)
        self.ffprobe = probe if os.path.isfile(probe) else shutil.which("ffprobe")
        self.version = run([self.exe, "-version"], 20)[1].split("\n")[0].split(" Copyright")[0][:60]
        m = re.search(r"version n?(\d+)\.(\d+)", self.version)
        if m and (5, 1) > (int(m.group(1)), int(m.group(2))):
            self.sync = ["-vsync", "0"]

    def probe(self, path):
        info = None
        if self.ffprobe:
            try:
                info = probe_ffprobe(self.ffprobe, path)
            except Exception as e:  # fall through to header parsing
                log("ffprobe failed (%s); parsing `ffmpeg -i` instead" % e)
        if info is None:
            info = probe_header(self.exe, path)
        if not info.get("frames") or not info.get("video_duration"):
            # stream copy into the null muxer: exact packet count, no decoding
            rc, out, _ = run([self.exe, "-nostdin", "-v", "error", "-progress", "pipe:1", "-i", path,
                              "-map", "0:v:%d" % info.get("vindex", 0), "-c", "copy", "-f", "null", "-"])
            fr = re.findall(r"^frame=(\d+)", out, re.M)
            ot = re.findall(r"^out_time=(-?\d+):(\d+):([\d.]+)", out, re.M)
            if fr and int(fr[-1]):
                info["frames"] = int(fr[-1])
            if ot:
                h, mi, s = ot[-1]
                t = abs(int(h)) * 3600 + int(mi) * 60 + float(s)  # start of the last frame
                info["video_duration"] = t + (1.0 / info["fps"] if info.get("fps") else 0.0)
        return info

    @staticmethod
    def filters(fps_a, size, select=None):
        vf = ["fps=%.6f" % fps_a]
        if select is not None:
            vf.append("select=" + "+".join("eq(n\\,%d)" % k for k in sorted(select)))
        vf += ["scale=%d:%d:flags=area" % tuple(size), "setsar=1"]
        return ",".join(vf)

    def frames(self, path, meta, fps_a, size, select=None):
        w, h = size
        cmd = [self.exe, "-nostdin", "-v", "error", "-i", path, "-map", "0:v:%d" % meta.get("vindex", 0),
               "-an", "-sn", "-vf", self.filters(fps_a, size, select)] + self.sync + [
               "-f", "rawvideo", "-pix_fmt", "rgb24", "-"]
        proc = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, stdin=subprocess.DEVNULL)
        err = []
        th = threading.Thread(target=lambda: err.append(proc.stderr.read()), daemon=True)
        th.start()
        ks = sorted(select) if select is not None else None
        i, done = 0, False
        try:
            while ks is None or len(ks) > i:
                buf = read_exact(proc.stdout, w * h * 3)
                if buf is None:
                    done = True
                    break
                yield (ks[i] if ks else i), Image.frombytes("RGB", (w, h), buf)
                i += 1
        finally:
            if done:
                proc.wait()
            elif proc.poll() is None:
                proc.kill()
                proc.wait()
            th.join(2)
        if i == 0:
            msg = b"".join(err).decode("utf-8", "replace").strip()
            if "fps_mode" in msg and self.sync[0] == "-fps_mode":  # pre-5.1 ffmpeg
                self.sync = ["-vsync", "0"]
                for item in self.frames(path, meta, fps_a, size, select):
                    yield item
                return
            raise RuntimeError("ffmpeg decoded no frames: " + msg[-300:])


class ImageioFFmpegBackend(FFmpegBackend):
    """imageio-ffmpeg: ships its own static ffmpeg binary (no ffprobe); frames via read_frames()."""
    name = "imageio-ffmpeg"

    def __init__(self):
        try:
            import imageio_ffmpeg
        except ImportError:
            raise Unavailable("python package imageio-ffmpeg not installed")
        import logging
        logging.getLogger("imageio_ffmpeg").setLevel(logging.ERROR)  # mute its resize warning
        self.iio = imageio_ffmpeg
        try:
            exe = imageio_ffmpeg.get_ffmpeg_exe()
        except Exception as e:
            raise Unavailable("imageio-ffmpeg has no usable binary (%s)" % e)
        FFmpegBackend.__init__(self, exe)
        self.ffprobe = None  # the wheel bundles ffmpeg only
        self.version = "imageio-ffmpeg %s, %s" % (imageio_ffmpeg.__version__, self.version)

    def frames(self, path, meta, fps_a, size, select=None):
        gen = self.iio.read_frames(path, pix_fmt="rgb24", output_params=[
            "-map", "0:v:%d" % meta.get("vindex", 0), "-an", "-sn",
            "-vf", self.filters(fps_a, size, select)] + self.sync)
        ks = sorted(select) if select is not None else None
        try:
            w, h = next(gen).get("size") or size
            for i, buf in enumerate(gen):
                if ks is not None and i >= len(ks):
                    break
                yield (ks[i] if ks else i), Image.frombytes("RGB", (w, h), buf)
        finally:
            gen.close()


class OpenCVBackend:
    name = "opencv"

    def __init__(self):
        try:
            import cv2
        except ImportError:
            raise Unavailable("python package cv2 (opencv-python) not installed")
        self.cv2, self.version = cv2, "opencv " + cv2.__version__

    def probe(self, path):
        cv2 = self.cv2
        cap = cv2.VideoCapture(path)
        if not cap.isOpened():
            raise RuntimeError("cv2.VideoCapture cannot open the file")
        fps = cap.get(cv2.CAP_PROP_FPS) or None
        n = int(cap.get(cv2.CAP_PROP_FRAME_COUNT) or 0) or None
        rot = int(cap.get(cv2.CAP_PROP_ORIENTATION_META)) % 360 if hasattr(cv2, "CAP_PROP_ORIENTATION_META") else None
        auto = hasattr(cv2, "CAP_PROP_ORIENTATION_AUTO") and bool(cap.get(cv2.CAP_PROP_ORIENTATION_AUTO))
        ok, fr = cap.read()
        cap.release()
        if not ok:
            raise RuntimeError("cv2 could not decode the first frame")
        fh, fw = fr.shape[:2]
        self.manual_rot = 0 if auto else (rot or 0)
        if auto and rot in (90, 270):  # frames arrive rotated: report the stored size
            fw, fh = fh, fw
        info = {"vindex": 0, "fps": fps, "frames": n, "width": fw, "height": fh, "sar": 1.0,
                "video_duration": (n / fps) if (n and fps) else None, "audio": {"present": None},
                "probe": "cv2.VideoCapture"}
        if rot is not None:
            info["rotation_cw"] = rot
        return info

    def frames(self, path, meta, fps_a, size, select=None):
        cv2, rot = self.cv2, self.manual_rot
        cap = cv2.VideoCapture(path)
        fps = meta.get("fps") or 30.0

        def stream():
            i, last = 0, -1.0
            while True:
                ok, fr = cap.read()
                if not ok:
                    return
                t = cap.get(cv2.CAP_PROP_POS_MSEC) / 1000.0
                if not (t > last) or (i and 0 >= t):
                    t = i / fps
                last = t
                yield t, fr
                i += 1
        pre = (size[1], size[0]) if rot in (90, 270) else tuple(size)
        try:
            for k, fr in resample(stream(), fps_a):
                if select is not None and k not in select:
                    continue
                img = Image.fromarray(cv2.cvtColor(cv2.resize(fr, pre, interpolation=cv2.INTER_AREA),
                                                   cv2.COLOR_BGR2RGB))
                yield k, (img.transpose(ROTATE_CW[rot]) if rot in ROTATE_CW else img)
        finally:
            cap.release()


class PyAVBackend:
    name = "pyav"

    def __init__(self):
        try:
            import av
        except ImportError:
            raise Unavailable("python package av (PyAV) not installed")
        self.av, self.version = av, "PyAV " + av.__version__

    def probe(self, path):
        with self.av.open(path) as c:
            vs = list(c.streams.video)
            if not vs:
                raise RuntimeError("no video stream in the file")
            v = vs[0]
            auds = list(c.streams.audio)
            rot = None
            for fr in c.decode(v):  # newer PyAV exposes the display matrix per frame
                if getattr(fr, "rotation", None) is not None:
                    rot = int(round(-fr.rotation)) % 360
                break
            if rot is None and num((v.metadata or {}).get("rotate")) is not None:
                rot = int(num(v.metadata["rotate"])) % 360
            info = {"vindex": 0, "fps": num(v.average_rate) or num(v.guessed_rate),
                    "frames": v.frames or None, "width": v.codec_context.width,
                    "height": v.codec_context.height, "sar": num(v.sample_aspect_ratio) or 1.0,
                    "duration": c.duration / 1e6 if c.duration else None,
                    "video_duration": float(v.duration * v.time_base) if v.duration and v.time_base else None,
                    "vcodec": v.codec_context.name, "probe": "PyAV",
                    "audio": {"present": bool(auds), "codec": auds[0].codec_context.name if auds else None}}
            if rot is not None:
                info["rotation_cw"] = rot
            return info

    def frames(self, path, meta, fps_a, size, select=None):
        rot = meta.get("rotation_cw") or 0  # PyAV does not auto-rotate
        pre = (size[1], size[0]) if rot in (90, 270) else tuple(size)
        with self.av.open(path) as c:
            v = c.streams.video[meta.get("vindex", 0)]
            v.thread_type = "AUTO"
            fps = meta.get("fps") or 30.0

            def stream():
                for i, fr in enumerate(c.decode(v)):
                    yield (fr.time if fr.time is not None else i / fps), fr
            for k, fr in resample(stream(), fps_a):
                if select is not None and k not in select:
                    continue
                try:  # swscale resize inside PyAV; plain PIL resize on old versions
                    img = fr.reformat(width=pre[0], height=pre[1], format="rgb24").to_image()
                except Exception:
                    img = fr.to_image().resize(pre, LANCZOS)
                yield k, (img.transpose(ROTATE_CW[rot]) if rot in ROTATE_CW else img)


def make_backend(name, args):
    if name == "ffmpeg":
        return FFmpegBackend(args.ffmpeg)
    if name == "imageio-ffmpeg":
        return ImageioFFmpegBackend()
    if name == "opencv":
        return OpenCVBackend()
    if name == "pyav":
        return PyAVBackend()
    raise Unavailable("unknown backend")


# ------------------------------------------------------------------- cut detection
def features(img):
    h = img.histogram()
    n = float(img.width * img.height)
    hist = [sum(h[c * 256 + b * 16: c * 256 + b * 16 + 16]) / n for c in range(3) for b in range(16)]
    return img, hist, ImageStat.Stat(img.convert("L")).mean[0]


def hist_dist(a, b):
    return sum(abs(x - y) for x, y in zip(a[1], b[1])) / 6.0


def dist(a, b):
    """0..1. Half colour-histogram distance (robust to motion), half pixel difference
    (catches cuts between similar-looking shots)."""
    pd = sum(ImageStat.Stat(ImageChops.difference(a[0], b[0])).mean) / 765.0
    return 0.5 * hist_dist(a, b) + 0.5 * min(1.0, 3.0 * pd)


def edge_corr(a, b):
    """Correlation of the two frames' edge maps: ~0 for a new shot, high when the layout stays
    (lighting change, jump cut, overlay or caption change)."""
    ea, eb = (x[0].convert("L").filter(ImageFilter.FIND_EDGES) for x in (a, b))
    sa, sb = ImageStat.Stat(ea), ImageStat.Stat(eb)
    if 1e-3 > sa.stddev[0] or 1e-3 > sb.stddev[0]:
        return 0.0
    eab = 255.0 * ImageStat.Stat(ImageChops.multiply(ea, eb)).mean[0]
    return (eab - sa.mean[0] * sb.mean[0]) / (sa.stddev[0] * sb.stddev[0])


def detect_cuts(F, fps_a, thr, min_shot):
    """Hard cuts: one-step spikes of the frame-difference score that stand out from the local
    (+-1 s) median and from both neighbours; flashes / glitches of 2 frames or fewer are ignored.
    Soft transitions (dissolve, fade, whip pan): frames ~0.8 s apart differ in colour like a
    cut although no single step does. Returned separately; they do not split shots."""
    n = len(F)
    s = [0.0] + [dist(F[i - 1], F[i]) for i in range(1, n)]
    win = max(4, int(round(fps_a)))

    def transient(i):
        for k in (1, 2):
            if n > i + k and 0.5 * thr > dist(F[i - 1], F[i + k]):      # entering a short excursion
                return True
            if i - 1 - k >= 0 and 0.5 * thr > dist(F[i - 1 - k], F[i]):  # leaving one
                return True
        return False

    hard = []
    for i in range(1, n):
        if 0.6 * thr > s[i]:
            continue
        ctx = [s[j] for j in range(max(1, i - win), min(n, i + win + 1)) if abs(j - i) > 1]
        base = statistics.median(ctx) if ctx else 0.0
        nb = max(s[i - 1], s[i + 1] if n > i + 1 else 0.0)
        if 3.0 * base + 0.05 > s[i] or 2.0 * nb > s[i] or transient(i):
            continue
        ec = edge_corr(F[i - 1], F[i])
        if thr > s[i] and ec > 0.15:  # weak spikes count only if the whole layout changed
            continue
        hard.append({"index": i, "score": round(s[i], 3), "baseline": round(base, 3), "edge_corr": round(ec, 2)})
    kept = []  # enforce a minimum shot length: keep the stronger of two close cuts
    for c in hard:
        if kept and min_shot > (c["index"] - kept[-1]["index"]) / fps_a:
            if c["score"] > kept[-1]["score"]:
                kept[-1] = c
            continue
        kept.append(c)
    for c in kept:
        c["time"] = round((c["index"] - 0.5) / fps_a, 2)       # midway between the two frames
        c["confidence"] = "high" if c["score"] >= 2 * thr or c["score"] >= 6 * c["baseline"] else "medium"
        lb, la = F[c["index"] - 1][2], F[c["index"]][2]
        if 12 > lb or 12 > la:
            c["note"] = "to black" if lb >= 12 else ("from black" if la >= 12 else "black")
        elif c["edge_corr"] >= 0.55:
            c["confidence"] = "low"
            c["note"] = "same layout: lighting change, jump cut or overlay? check"

    g = max(2, int(round(0.4 * fps_a)))
    hard_idx = [c["index"] for c in kept]
    D = [0.0] * n
    for i in range(g + 1, n - g - 1):
        if any(i + g + 1 >= h > i - g - 1 for h in hard_idx):
            continue
        pairs = [(i - g - 1, i + g + 1), (i - g, i + g), (i - g + 1, i + g - 1)]  # min of 3: ignores flashes
        if min(hist_dist(F[a], F[b]) for a, b in pairs) >= 0.25:
            D[i] = min(dist(F[a], F[b]) for a, b in pairs)
    soft, i = [], g
    while n - g > i:
        if D[i] >= 0.4 and D[i] >= max(D[i - g:i + g + 1]):
            a, b = i, i
            while a > g and D[a - 1] >= 0.5 * D[i]:
                a -= 1
            while n - g - 1 > b and D[b + 1] >= 0.5 * D[i]:
                b += 1
            soft.append({"time": round(i / fps_a, 2), "score": round(D[i], 3), "from": round((a - g) / fps_a, 2),
                         "to": round((b + g) / fps_a, 2), "before_index": a - g, "after_index": b + g,
                         "peak_index": i})
            i = b + g + 1
        else:
            i += 1
    return kept, soft, s


def dark_spans(F, fps_a, level=12.0):
    """Runs of near-black frames (fade to/from black, black frames between shots)."""
    spans, start = [], None
    for i, f in enumerate(F + [(None, None, 255.0)]):
        if level > f[2] and start is None:
            start = i
        elif f[2] >= level and start is not None:
            if i - start >= 2:
                if spans and 0.2 >= start / fps_a - spans[-1]["end"]:   # bridge 1-2 frame gaps
                    spans[-1]["end"] = round(i / fps_a, 2)
                else:
                    spans.append({"start": round(start / fps_a, 2), "end": round(i / fps_a, 2)})
            start = None
    return spans


# ----------------------------------------------------------------------- drawing
class Painter:
    def __init__(self, font=None):
        self.pref, self.cache = font, {}

    def font(self, px):
        if px not in self.cache:
            f = None
            if self.pref != "bitmap":
                for p in ([self.pref] if self.pref else []) + FONT_FILES:
                    try:
                        f = ImageFont.truetype(p, px)
                        break
                    except Exception:
                        pass
                if f is None:
                    try:  # Pillow >= 10.1 ships a scalable default font
                        f = ImageFont.load_default(size=px)
                        if not isinstance(f, ImageFont.FreeTypeFont):
                            f = None
                    except Exception:
                        f = None
            self.cache[px] = f
        return self.cache[px]

    @staticmethod
    def bbox(font, text):
        try:
            return font.getbbox(text)
        except AttributeError:  # very old Pillow
            w, h = font.getsize(text)
            return 0, 0, w, h

    def label(self, text, px, fg=(255, 255, 255), bg=(0, 0, 0)):
        f, pad = self.font(px), max(2, px // 5)
        if f is not None:
            l, t, r, b = self.bbox(f, text)
            im = Image.new("RGB", (r - l + 2 * pad, b - t + 2 * pad), bg)
            ImageDraw.Draw(im).text((pad - l, pad - t), text, font=f, fill=fg)
            return im
        f = ImageFont.load_default()  # bitmap fallback: draw small, scale up
        l, t, r, b = self.bbox(f, text)
        im = Image.new("RGB", (r - l + 2, b - t + 2), bg)
        ImageDraw.Draw(im).text((1 - l, 1 - t), text, font=f, fill=fg)
        k = max(1, int(round(px / float(max(1, b - t)))))
        im = im.resize((im.width * k, im.height * k), NEAREST)
        out = Image.new("RGB", (im.width + 2 * pad, im.height + 2 * pad), bg)
        out.paste(im, (pad, pad))
        return out

    def fit_label(self, text, px, max_w, **kw):
        lab = self.label(text, px, **kw)
        while lab.width > max_w and px > 9:
            px = int(px * 0.85)
            lab = self.label(text, px, **kw)
        return lab if max_w >= lab.width else lab.crop((0, 0, max_w, lab.height))


def make_tile(painter, img, size, top_left, top_right=None, bottom_left=None, border=None):
    tile = img.resize(size, LANCZOS) if img.size != tuple(size) else img.copy()
    px = max(12, int(min(size) * 0.11))
    m = max(2, px // 6)
    room = size[0] - 2 * m
    if top_right:
        tag = painter.fit_label(top_right, px, size[0] // 2, bg=(200, 0, 0))
        tile.paste(tag, (size[0] - tag.width - m, m))
        room -= tag.width + m
    tile.paste(painter.fit_label(top_left, px, room), (m, m))
    if bottom_left:
        lab = painter.fit_label(bottom_left, int(px * 0.8), size[0] - 2 * m)
        tile.paste(lab, (m, size[1] - lab.height - m))
    if border:
        d = ImageDraw.Draw(tile)
        for k in range(max(3, px // 6)):
            d.rectangle([k, k, size[0] - 1 - k, size[1] - 1 - k], outline=border)
    return tile


def header_rows(painter, text, width, px=20):
    """Header text as label rows that fit `width`: wrap at ' | ', shrink only if one part is too wide."""
    rows, line = [], ""
    for part in text.split(" | "):
        trial = part if not line else line + " | " + part
        if line and painter.label(trial, px).width > width:
            rows.append(line)
            line = part
        else:
            line = trial
    rows.append(line)
    return [painter.fit_label(r, px, width, bg=(24, 24, 24)) for r in rows]


def pack_sheets(cells, header, prefix, out_dir, painter, max_edge, max_px, gap=6):
    """Lay equal-size cells on as few sheets as possible, each sheet at most max_edge per side and
    at most max_px pixels (so assistants do not downscale the sheet before looking at it)."""
    if not cells:
        return []
    cw, ch = cells[0].size
    n, best = len(cells), None
    for cols in range(1, n + 1):
        W = cols * cw + (cols + 1) * gap
        hh = sum(r.height for r in header_rows(painter, header % (9, 9), W - 2 * gap)) + gap
        for rows in range(1, n + 1):
            H = hh + rows * ch + (rows + 1) * gap
            if (W > max_edge or H > max_edge or W * H > max_px) and (cols, rows) != (1, 1):
                continue
            per = cols * rows
            pages = -(-n // per)
            key = (pages, per * pages - n, abs(math.log(W / float(H))))
            if best is None or best[0] > key:
                best = (key, cols, rows)
    _, cols, rows = best
    per, paths = cols * rows, []
    pages = -(-n // per)
    for p in range(pages):
        chunk = cells[p * per:(p + 1) * per]
        r = -(-len(chunk) // cols)
        c = min(cols, len(chunk))
        W = c * cw + (c + 1) * gap
        head = header_rows(painter, header % (p + 1, pages), W - 2 * gap)
        hh = sum(x.height for x in head) + gap
        sheet = Image.new("RGB", (W, hh + r * ch + (r + 1) * gap), (24, 24, 24))
        y = 2
        for x in head:
            sheet.paste(x, (gap, y))
            y += x.height
        for i, cell in enumerate(chunk):
            sheet.paste(cell, (gap + (i % c) * (cw + gap), hh + gap + (i // c) * (ch + gap)))
        path = os.path.join(out_dir, "%s_%s.jpg" % (prefix, str(p + 1).zfill(2)))
        sheet.save(path, "JPEG", quality=85)
        paths.append(path)
    return paths


# ---------------------------------------------------------------------- the scan
def fit(dw, dh, long_side):
    k = long_side / float(max(dw, dh))
    return max(2, int(round(dw * k / 2)) * 2), max(2, int(round(dh * k / 2)) * 2)


def default_interval(d):
    if 15.5 >= d:
        return 0.5
    if 61 >= d:
        return 1.0
    if 120 >= d:
        return 2.0
    return math.ceil(d / 60.0 * 2) / 2.0  # about 60 samples


def _plan(total, k, hard, dark, soft, max_seg, min_seg):
    min_seg = min(min_seg, total / k)  # a very short clip cannot honour the floor; keep parts equal
    segs, start = [], 0.0
    for i in range(1, k):
        left = k - i + 1  # parts still to cut, this one included
        target = start + (total - start) / left
        lo = max(start + min_seg, total - (left - 1) * max_seg)
        hi = min(start + max_seg, total - (left - 1) * min_seg)
        end = kind = None
        for cands, label in ((hard, "cut"), (dark, "black gap"), (soft, "transition")):
            inside = [t for t in cands if hi >= t >= lo]
            if inside:
                end, kind = min(inside, key=lambda t: abs(t - target)), label
                break
        if end is None:
            end, kind = min(max(target, lo), hi), "mid-shot"
        segs.append({"start": round(start, 2), "end": round(end, 2), "duration": round(end - start, 2), "ends_at": kind})
        start = end
    segs.append({"start": round(start, 2), "end": round(total, 2), "duration": round(total - start, 2), "ends_at": "end"})
    return segs


def plan_segments(total, hard, soft, max_seg, dark=(), min_seg=4.0):
    """Split the clip into generation segments of at most max_seg s, each >= min_seg s, with boundaries
    as close to an even split as the clip allows: at a hard cut, else the middle of a black gap,
    else a soft transition, else mid-shot ('mid-shot' = needs last-frame continuity into the next
    segment). Uses the fewest parts, but takes one or two extra parts when that avoids a mid-shot
    split. Balanced parts never leave a sliver at the end."""
    if max_seg + 1e-6 >= total:
        return [{"start": 0.0, "end": round(total, 2), "duration": round(total, 2), "ends_at": "end"}]
    k = int(math.ceil(total / max_seg - 1e-9))
    best = None
    for kk in range(k, k + 3):
        if min_seg > total / kk and kk > k:
            break
        plan = _plan(total, kk, hard, dark, soft, max_seg, min_seg)
        mids = sum(1 for s in plan if s["ends_at"] == "mid-shot")
        if best is None or best[0] > mids:
            best = (mids, plan)
        if mids == 0:
            break
    return best[1]


def half_up(t):
    """Round to the nearest whole second, halves up (Python's round() is banker's rounding)."""
    return int(math.floor(float(t) + 0.5))


def cluster_boundaries(hard=(), dark=(), soft=(), window=1.5):
    """One boundary per scene change. A wipe through black registers as a soft transition AND a
    black gap a moment apart; candidates closer than `window` s become one boundary, taken from
    the most exact source present: a hard cut, else the middle of the black gap, else the soft peak."""
    tagged = sorted([(t, 0) for t in hard] + [(t, 1) for t in dark] + [(t, 2) for t in soft])
    groups = []
    for t, rank in tagged:
        if groups and window > t - groups[-1][-1][0]:
            groups[-1].append((t, rank))
        else:
            groups.append([(t, rank)])
    out = []
    for g in groups:
        best = min(r for _, r in g)
        ts = [t for t, r in g if r == best]
        out.append(sum(ts) / len(ts))
    return out


def whole_second_beats(total, times, min_beat=1):
    """Boundaries rounded to whole seconds for a prompt timeline ([0s-3s] ...). Boundaries that
    round onto each other, onto the clip's ends, or closer than `min_beat` s merge away, and the
    last beat ends on the rounded duration. Action beats inside a long shot are the assistant's job."""
    end = max(1, half_up(total))
    marks = []
    for t in sorted(times):
        s = half_up(t)
        if end - min_beat >= s >= min_beat and (not marks or s - marks[-1] >= min_beat):
            marks.append(s)
    bounds = [0] + marks + [end]
    return {"duration_s": end,
            "beats": [{"from": a, "to": b, "label": "[%ds-%ds]" % (a, b)} for a, b in zip(bounds, bounds[1:])]}


def eight_n_plus_one(frames, fps):
    """Some edit modes (Seedance 2.5) only keep the exact input length when the input has 8n+1
    frames; otherwise the output comes back ~0.3 s short. Largest 8n+1 count no larger than the clip's frames."""
    if not frames or not fps or 9 > int(frames):
        return None
    k = ((int(frames) - 1) // 8) * 8 + 1
    return {"frames": k, "seconds": round(k / float(fps), 3), "drop_frames": int(frames) - k}


def scan(be, path, args, mp4, out_dir):
    t_begin = time.time()
    meta = be.probe(path)
    for k in ("duration", "video_duration", "fps", "frames", "width", "height"):
        if not meta.get(k) and mp4.get(k):
            meta[k] = mp4[k]
    if meta.get("rotation_cw") is None:
        meta["rotation_cw"] = mp4.get("rotation_cw", 0)
    if (meta.get("audio") or {}).get("present") is None:
        meta["audio"] = ({"present": mp4["has_audio"], "codec": mp4.get("audio_codec"), "source": "mp4 header"}
                         if "has_audio" in mp4 else {"present": None, "note": "unknown with this decoder"})
    if not meta.get("width") or not meta.get("height"):
        raise RuntimeError("could not read the frame size")
    rot = meta["rotation_cw"] if meta["rotation_cw"] in (90, 180, 270) else 0
    dw, dh = meta["width"] * (meta.get("sar") or 1.0), meta["height"]
    if rot in (90, 270):
        dw, dh = dh, dw
    dur = meta.get("duration") or meta.get("video_duration") or 0.0
    native = meta.get("fps") if (meta.get("fps") or 0) > 0 else 30.0
    cap = args.analysis_fps or (15.0 if 180 >= dur else max(2.0, 2400.0 / dur))
    # analysis rate: every k-th source frame (exact frames for constant-rate video); VFR: fixed rate
    fps_a = cap if mp4.get("vfr") else native / max(1, math.ceil(native / cap - 1e-6))

    # pass 1: tiny frames for cut detection
    F = [features(img) for _, img in be.frames(path, meta, fps_a, fit(dw, dh, ANALYSIS_LONG))]
    n = len(F)
    if 2 > n:
        raise RuntimeError("decoded fewer than 2 frames")
    vdur = meta.get("video_duration") or n / fps_a
    if meta.get("frames") and native and not mp4.get("vfr"):
        vdur = meta["frames"] / float(native)  # constant frame rate: frames / fps is the exact length
    dur = dur or vdur
    cuts, soft, scores = detect_cuts(F, fps_a, args.threshold, args.min_shot)
    bounds = [0] + [c["index"] for c in cuts] + [n]
    shots = []
    for i in range(len(bounds) - 1):
        a, b = bounds[i], bounds[i + 1]
        start = 0.0 if i == 0 else cuts[i - 1]["time"]
        end = vdur if i == len(bounds) - 2 else cuts[i]["time"]
        mid = (a + b - 1) // 2
        shots.append({"shot": i + 1, "start": round(start, 2), "end": round(end, 2),
                      "duration": round(end - start, 2), "first_index": a, "keyframe_time": round(mid / fps_a, 2),
                      "keyframe_index": mid})

    def shot_of(k):
        return next(s["shot"] for s in reversed(shots) if k >= s["first_index"])

    dark = dark_spans(F, fps_a)
    dark_mids = [round((d["start"] + d["end"]) / 2, 2) for d in dark]
    cut_t, soft_t = [c["time"] for c in cuts], [c["time"] for c in soft]
    scene_t = cluster_boundaries(cut_t, dark_mids, soft_t)  # one candidate per scene change
    segments = plan_segments(vdur, cut_t, soft_t, args.max_seg, dark_mids)
    for g in segments:  # local whole-second beats: every part restarts at 0s in its own prompt
        # a part's whole-second length comes from its rounded boundaries, so the parts add up to the clip
        g["prompt_seconds"] = max(1, half_up(g["end"]) - half_up(g["start"]))
        local = [t - g["start"] for t in scene_t if g["end"] - 0.5 > t > g["start"] + 0.5]
        g["prompt_beats"] = whole_second_beats(g["prompt_seconds"], local)

    interval = args.interval or default_interval(dur)
    samples, t = [], 0.0
    while vdur - 0.25 / fps_a > t:
        k = min(n - 1, int(round(t * fps_a)))
        if k not in samples:
            samples.append(k)
        t += interval
    if (n - 1) / fps_a - samples[-1] / fps_a > interval / 2:
        samples.append(n - 1)
    want = set(samples) | {s["keyframe_index"] for s in shots}
    for c in cuts:
        want |= {c["index"] - 1, c["index"]}
    for c in soft:  # four frames across each soft span: a whip pan and a dissolve look different here
        a, b = c["before_index"], c["after_index"]
        c["strip"] = sorted({a, a + (b - a) // 3, a + 2 * (b - a) // 3, b})
        want |= set(c["strip"])

    # pass 2: only the frames that go on the sheets, at sheet resolution
    keep = dict(be.frames(path, meta, fps_a, fit(dw, dh, max(args.tile, args.shot_tile)), select=want))
    if not keep:
        raise RuntimeError("second pass decoded no frames")
    for k in want - set(keep):  # tail frames a decoder may not reproduce exactly
        keep[k] = keep[min(keep, key=lambda j: abs(j - k))]

    painter = Painter(args.font)
    name = os.path.basename(path)
    name = name if 40 >= len(name) else name[:37] + "..."
    aud = {True: "yes", False: "no"}.get(meta["audio"].get("present"), "unknown")
    info = ("%s | %.2fs %dx%d %.4gfps audio:%s" % (name, vdur, round(dw), round(dh), native, aud)).replace("%", "%%")
    tsz = fit(dw, dh, args.tile)
    ssz = fit(dw, dh, args.shot_tile if 18 >= len(shots) else args.tile)  # many shots: smaller tiles
    cut_idx = [c["index"] for c in cuts]

    cells, prev = [], -1
    for k in samples:
        nc = sum(1 for c in cut_idx if k >= c > prev) if prev >= 0 else 0
        tag = None if not nc else ("CUT" if nc == 1 else "%d CUTS" % nc)
        cells.append(make_tile(painter, keep[k], tsz, "%s  S%d" % (fmt_ts(k / fps_a), shot_of(k)), tag,
                               border=(200, 0, 0) if nc else None))
        prev = k
    timeline = pack_sheets(cells, "TIMELINE %d/%d | " + info + " | every %gs | red CUT = new shot since previous tile"
                           % interval, "timeline", out_dir, painter, args.sheet_edge, args.sheet_px)
    cells = [make_tile(painter, keep[s["keyframe_index"]], ssz,
                       "S%d %s-%s (%.1fs)" % (s["shot"], fmt_ts(s["start"]), fmt_ts(s["end"]), s["duration"]),
                       bottom_left="frame @%s" % fmt_ts(s["keyframe_time"])) for s in shots]
    shot_sheets = pack_sheets(cells, "SHOTS %d/%d | " + info + " | one frame per shot", "shots", out_dir,
                              painter, args.sheet_edge, args.sheet_px)
    cells, few = [], 12 >= len(cuts)  # many cuts: only the uncertain ones go on the cuts sheet
    for j, c in enumerate(cuts):
        if not few and c["confidence"] == "high":
            continue
        pair = Image.new("RGB", (2 * tsz[0] + 6, tsz[1]), (200, 0, 0))
        pair.paste(make_tile(painter, keep[c["index"] - 1], tsz, "C%d before %s" % (j + 1, fmt_ts((c["index"] - 1) / fps_a, 2))), (0, 0))
        pair.paste(make_tile(painter, keep[c["index"]], tsz, "after %s" % fmt_ts(c["index"] / fps_a, 2)), (tsz[0] + 6, 0))
        cells.append(pair)
    cut_sheets = pack_sheets(cells, "CUTS %d/%d | " + info + (" | " if few else " | medium/low-confidence cuts only | ")
                             + "left = before, right = after",
                             "cuts", out_dir, painter, args.sheet_edge, args.sheet_px)
    cells = []  # soft transitions get their own sheet: 4 frames across the span, oldest first
    for j, c in enumerate(soft):
        idxs = c["strip"]
        strip = Image.new("RGB", (len(idxs) * tsz[0] + (len(idxs) - 1) * 6, tsz[1]), (230, 160, 0))
        for m, k in enumerate(idxs):
            lab = ("SOFT%d? %s" % (j + 1, fmt_ts(k / fps_a, 2))) if m == 0 else fmt_ts(k / fps_a, 2)
            strip.paste(make_tile(painter, keep[k], tsz, lab), (m * (tsz[0] + 6), 0))
        cells.append(strip)
    if cells and len({c.size for c in cells}) > 1:  # a span too short for 4 distinct frames: pad to equal size
        W = max(c.size[0] for c in cells)
        padded = []
        for c in cells:
            p = Image.new("RGB", (W, tsz[1]), (24, 24, 24))
            p.paste(c, (0, 0))
            padded.append(p)
        cells = padded
    soft_sheets = pack_sheets(cells, "SOFT %d/%d | " + info + " | possible dissolve / wipe / fade / whip pan, "
                              "4 frames left to right | new place = a scene change; same place = a camera move",
                              "soft", out_dir, painter, args.sheet_edge, args.sheet_px)

    grabs = []  # optional full-resolution stills, e.g. first/last frame of every segment
    if args.grab:
        idx = set()
        for tok in args.grab.split(","):
            tok = tok.strip().lower()
            if tok == "segments":  # first and last frame of every segment
                for g in segments:
                    idx |= {int(math.ceil(g["start"] * fps_a - 1e-6)), int(math.floor(g["end"] * fps_a - 1e-6))}
            elif tok == "end":
                idx.add(n - 1)
            elif num(tok) is not None:
                idx.add(int(round(num(tok) * fps_a)))
        idx = {min(n - 1, max(0, k)) for k in idx}
        if idx:
            os.makedirs(os.path.join(out_dir, "frames"), exist_ok=True)
            for k, img in be.frames(path, meta, fps_a, fit(dw, dh, min(1920, max(dw, dh))), select=idx):
                fp = os.path.join(out_dir, "frames", "frame_" + ("%.3f" % (k / fps_a)).zfill(7) + "s.jpg")
                img.save(fp, "JPEG", quality=92)
                grabs.append({"time": round(k / fps_a, 3), "path": fp})

    result = {
        "file": os.path.abspath(path), "backend": be.name, "decoder": be.version, "probe": meta.get("probe"),
        "duration_s": round(dur, 3), "video_duration_s": round(vdur, 3),
        "fps": round(native, 3), "frame_count": meta.get("frames"), "vfr": mp4.get("vfr"),
        "width": meta["width"], "height": meta["height"], "sample_aspect_ratio": round(meta.get("sar") or 1.0, 4),
        "rotation_cw": rot, "display_width": int(round(dw)), "display_height": int(round(dh)),
        "audio": meta["audio"], "video_codec": meta.get("vcodec") or mp4.get("video_codec"),
        "analysis": {"fps": round(fps_a, 3), "frames": n, "threshold": args.threshold, "min_shot_s": args.min_shot,
                     "cut_time_precision_s": round(1.0 / fps_a, 3)},
        "sampling": {"interval_s": interval, "times_s": [round(k / fps_a, 2) for k in samples]},
        "cuts": [{k: c[k] for k in ("time", "score", "baseline", "edge_corr", "confidence", "note") if k in c}
                 for c in cuts],
        "soft_transitions": [{k: c[k] for k in ("time", "from", "to", "score")} for c in soft],
        "shots": [{k: s[k] for k in ("shot", "start", "end", "duration", "keyframe_time")} for s in shots],
        "dark_spans": dark,
        "prompt_beats": whole_second_beats(vdur, cut_t),
        "prompt_beats_with_transitions": whole_second_beats(vdur, scene_t),
        "edit_trim_8n1": eight_n_plus_one(meta.get("frames"), native),
        "segments": {"max_s": args.max_seg, "list": segments},
        "sheets": {"timeline": timeline, "shots": shot_sheets, "cuts": cut_sheets, "soft": soft_sheets},
        "grabs": grabs,
        "mp4_header": mp4, "seconds_taken": round(time.time() - t_begin, 2),
    }
    if args.debug:
        result["debug_scores"] = [round(x, 3) for x in scores]
    return result


def summary(r):
    a = r["audio"]
    aud = {True: "yes", False: "no"}.get(a.get("present"), "unknown")
    if a.get("present"):
        aud += " (%s)" % ", ".join(str(x) for x in (a.get("codec"), a.get("sample_rate") and "%d Hz" % a["sample_rate"],
                                                     a.get("channels")) if x)
    L = ["VIDEO SCAN  %s" % os.path.basename(r["file"]),
         "decoder     %s (%s; metadata via %s)" % (r["backend"], r["decoder"], r["probe"]),
         "duration    %.2f s  (the video stream: use this one; the file container says %.2f s)" % (
             r["video_duration_s"], r["duration_s"]),
         "frames      %s at %.4g fps%s" % (r["frame_count"] or "?", r["fps"], " (variable frame rate)" if r["vfr"] else ""),
         "resolution  %dx%d stored, rotation %d deg -> displayed %dx%d" % (r["width"], r["height"], r["rotation_cw"],
                                                                       r["display_width"], r["display_height"]),
         "audio       " + aud,
         "cuts        %d hard cut(s) (analysed %d frames at %.3g fps, timing +-%.2f s)" % (
             len(r["cuts"]), r["analysis"]["frames"], r["analysis"]["fps"], r["analysis"]["cut_time_precision_s"])]
    many = len(r["cuts"]) > 15
    if many:  # long clips: one compact line, uncertain cuts spelled out below
        L.append("            at " + ", ".join(fmt_ts(c["time"], 2) for c in r["cuts"]))
    for c in r["cuts"]:
        if not many or c["confidence"] != "high":
            L.append("            %s  score %.2f  %s%s" % (fmt_ts(c["time"], 2), c["score"], c["confidence"],
                                                         "  (%s)" % c["note"] if c.get("note") else ""))
    for c in r["soft_transitions"]:
        L.append("soft?       %s - %s  possible dissolve / wipe / whip pan (score %.2f, check the soft sheet)" % (
            fmt_ts(c["from"], 2), fmt_ts(c["to"], 2), c["score"]))
    for d in r["dark_spans"]:
        L.append("dark        %s - %s (black / fade)" % (fmt_ts(d["start"], 2), fmt_ts(d["end"], 2)))
    shots = ["S%d %s-%s (%.1fs)" % (s["shot"], fmt_ts(s["start"]), fmt_ts(s["end"]), s["duration"]) for s in r["shots"]]
    L.append("shots       " + (" | ".join(shots) if many else ("\n            ".join(shots))))
    pb, pt = r["prompt_beats"], r["prompt_beats_with_transitions"]
    L.append("prompt      %d s in whole seconds; beats from the hard cuts: %s"
             % (pb["duration_s"], " ".join(b["label"] for b in pb["beats"])))
    if pt["beats"] != pb["beats"]:
        L.append("            with the soft transitions / black gaps too: %s"
                 % " ".join(b["label"] for b in pt["beats"]))
        L.append("            (keep a transition boundary only if the soft sheet shows a new place; add action beats yourself)")
    else:
        L.append("            (add action beats inside long shots yourself)")
    tr = r.get("edit_trim_8n1")
    if tr:
        L.append("edit trim   8n+1 frames for exact-length edits: %d frames = %.3f s (%s)" % (
            tr["frames"], tr["seconds"], "already 8n+1" if not tr["drop_frames"] else "drop the last %d frame(s)" % tr["drop_frames"]))
    segs = r["segments"]["list"]
    L.append("segments    up to %gs each, local time restarts at 0:00 in every segment" % r["segments"]["max_s"])
    for i, g in enumerate(segs):
        L.append("            SEG%d %s - %s  (%.2f s, ends at %s)%s" % (
            i + 1, fmt_ts(g["start"]), fmt_ts(g["end"]), g["duration"], g["ends_at"],
            ("  prompt: %d s, beats (cuts + candidate transitions): %s" % (
                g["prompt_seconds"], " ".join(b["label"] for b in g["prompt_beats"]["beats"]))) if len(segs) > 1 else ""))
    sh = r["sheets"]
    L.append("sampling    every %gs -> %d tiles" % (r["sampling"]["interval_s"], len(r["sampling"]["times_s"])))
    L.append("sheets      " + "  ".join(os.path.basename(p) for p in sh["timeline"] + sh["shots"] + sh["cuts"] + sh["soft"]))
    if r["grabs"]:
        L.append("stills      " + "  ".join("frames/" + os.path.basename(g["path"]) for g in r["grabs"]))
    L.append("folder      " + os.path.dirname(sh["timeline"][0]))
    L.append("NEXT        view timeline sheets in order (labels = M:SS.s from the start), then shots sheets "
             "(count people per shot), then cuts sheets (reject false cuts), then soft sheets "
             "(new place = scene change, same place = camera move).")
    return "\n".join(L)


def main(argv=None):
    ap = argparse.ArgumentParser(description="Scan a video for a chat assistant: metadata, cuts, contact sheets.")
    ap.add_argument("input", nargs="?")
    ap.add_argument("--check", action="store_true", help="only list which decoders this sandbox has")
    ap.add_argument("--out", help="output folder (default ./scan_NAME)")
    ap.add_argument("--backend", default="auto", choices=["auto"] + BACKENDS)
    ap.add_argument("--skip", default="", help="comma list of backends to treat as missing, e.g. ffmpeg")
    ap.add_argument("--ffmpeg", help="path to an ffmpeg binary")
    ap.add_argument("--interval", type=float, help="seconds between timeline tiles (default 0.5/1/2+ by length)")
    ap.add_argument("--tile", type=int, default=384, help="timeline tile long side, px")
    ap.add_argument("--shot-tile", type=int, default=560, help="shot tile long side, px")
    ap.add_argument("--sheet-edge", type=int, default=1568, help="max sheet side, px")
    ap.add_argument("--sheet-px", type=int, default=1150000, help="max sheet area, px")
    ap.add_argument("--threshold", type=float, default=0.2, help="cut score threshold 0..1 (lower = more cuts)")
    ap.add_argument("--min-shot", type=float, default=0.25, help="shortest shot kept, s")
    ap.add_argument("--analysis-fps", type=float, help="cut-detection frame rate (default 15 or less)")
    ap.add_argument("--max-seg", type=float, default=15.0, help="longest generation segment to plan, s")
    ap.add_argument("--font", help="TTF path, or 'bitmap' to force Pillow's built-in font")
    ap.add_argument("--grab", help="full-res stills: seconds and/or 'end', 'segments' (e.g. 0,4.5,end)")
    ap.add_argument("--debug", action="store_true", help="add per-frame cut scores to scan.json")
    args = ap.parse_args(argv)

    if args.check:
        print("Pillow: %s" % (Image.__version__ if Image else "MISSING (pip install pillow)"))
        for name in BACKENDS:
            try:
                be = make_backend(name, args)
                print("%-15s available  %s%s" % (name, be.version, "  + ffprobe" if getattr(be, "ffprobe", None) else ""))
            except Unavailable as e:
                print("%-15s missing    %s" % (name, e))
        return 0
    path = args.input
    if not path:
        ap.print_usage()
        return 1
    if not os.path.isfile(path):
        print("ERROR: file not found: %s" % path)
        return 1
    stem = re.sub(r"[^\w.-]+", "_", os.path.splitext(os.path.basename(path))[0])[:60]
    out_dir = args.out or os.path.join(os.getcwd(), "scan_" + stem)
    os.makedirs(out_dir, exist_ok=True)
    try:
        mp4 = mp4_probe(path)
    except Exception as e:
        mp4 = {"error": str(e)}
    if Image is None:
        print("ERROR: Pillow (PIL) is required for frames and contact sheets: pip install pillow")
        print("MP4 header only: " + json.dumps(mp4))
        return 3

    skip = {s.strip() for s in args.skip.split(",") if s.strip()}
    order = BACKENDS if args.backend == "auto" else [args.backend]
    tried = []
    for name in order:
        if name in skip:
            tried.append("%s: skipped (--skip)" % name)
            continue
        try:
            be = make_backend(name, args)
        except Unavailable as e:
            tried.append("%s: %s" % (name, e))
            continue
        try:
            result = scan(be, path, args, mp4, out_dir)
        except Exception as e:
            tried.append("%s: failed (%s: %s)" % (name, type(e).__name__, e))
            log("backend %s failed: %s - trying the next one" % (name, e))
            continue
        result["backends_tried"] = tried + ["%s: used" % name]
        with open(os.path.join(out_dir, "scan.json"), "w", encoding="utf-8") as f:
            json.dump(result, f, indent=1)
        print(summary(result))
        return 0

    print("ERROR: no working video decoder in this environment.")
    for t in tried:
        print("  - " + t)
    if mp4.get("duration"):
        print("MP4 header (no decoding): duration %.2f s, %sx%s, %.3g fps, rotation %s deg, audio track: %s" % (
            mp4["duration"], mp4.get("width"), mp4.get("height"), mp4.get("fps") or 0,
            mp4.get("rotation_cw", 0), "yes" if mp4.get("has_audio") else "no"))
    print("FIX: pip install imageio-ffmpeg   (bundles its own ffmpeg; or opencv-python-headless, or av)")
    print("     If packages cannot be installed: ask the user for screenshots at known timestamps, or use an")
    print("     assistant that accepts video natively (e.g. Gemini).")
    with open(os.path.join(out_dir, "scan.json"), "w", encoding="utf-8") as f:
        json.dump({"file": os.path.abspath(path), "error": "no decoder", "backends_tried": tried, "mp4_header": mp4}, f, indent=1)
    return 2


if __name__ == "__main__":
    sys.exit(main())
