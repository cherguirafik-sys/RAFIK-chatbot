import {Config} from '@remotion/cli/config';

// Rendu en H.264, 30 images par seconde
Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(92);
Config.setCodec('h264');
Config.setCrf(19);

// Dans cet environnement cloud, on réutilise le Chromium déjà installé.
// Sur ton ordinateur, supprime cette ligne : Remotion télécharge son propre navigateur.
if (process.env.REMOTION_CHROME) {
  Config.setBrowserExecutable(process.env.REMOTION_CHROME);
}
