import { Config } from "@remotion/cli/config";

// Utilise le navigateur Chromium déjà installé sur la machine
Config.setBrowserExecutable("/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell");
Config.setChromiumOpenGlRenderer("swangle");
