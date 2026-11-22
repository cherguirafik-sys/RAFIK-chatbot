import {Composition} from 'remotion';
import {EmuTest, EMU_FRAMES} from './scenes/EmuTest';
import {FryTest, FRY_FRAMES} from './scenes/FryTest';
import {SnowTest, SNOW_FRAMES} from './scenes/SnowTest';
import {BlackFriday, BF_W, BF_H, BF_FRAMES} from './scenes/BlackFriday';
import {ModelSheet} from './scenes/ModelSheet';
export const Root=()=> <>
<Composition id="EmuTest" component={EmuTest} width={1080} height={1920} fps={30} durationInFrames={EMU_FRAMES}/>
<Composition id="FryTest" component={FryTest} width={1080} height={1920} fps={30} durationInFrames={FRY_FRAMES}/>
<Composition id="SnowTest" component={SnowTest} width={1080} height={1920} fps={30} durationInFrames={SNOW_FRAMES}/>
<Composition id="BlackFriday" component={BlackFriday} width={BF_W} height={BF_H} fps={30} durationInFrames={BF_FRAMES}/>
<Composition id="ModelSheet" component={ModelSheet} width={1600} height={1200} fps={30} durationInFrames={1}/>
</>;
