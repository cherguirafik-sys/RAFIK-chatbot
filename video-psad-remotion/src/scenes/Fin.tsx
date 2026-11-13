import React from 'react';
import {C, SANS, SERIF} from '../theme';
import {center, Cross, Rise, Rule} from '../components/ui';

export const Fin: React.FC = () => (
  <>
    <Rise at={0} dur={0.6} dy={0} style={{...center, top: 500, fontFamily: SANS, fontWeight: 500, fontSize: 30, letterSpacing: 8, color: C.teal}}>EN RÉSUMÉ</Rise>
    <Rise at={0.3} style={{...center, top: 680, fontFamily: SERIF, fontWeight: 700, fontSize: 130, lineHeight: 1, color: C.ink}}>
      Un business
      <br />
      récurrent
    </Rise>
    <Rise at={0.7} style={{...center, top: 975, fontFamily: SERIF, fontStyle: 'italic', fontWeight: 500, fontSize: 104, color: C.teal}}>et en croissance</Rise>
    <Rule at={1.3} width={360} top={1170} />
    <Rise at={1.5} style={{...center, top: 1220, padding: '0 110px', boxSizing: 'border-box', fontFamily: SERIF, fontStyle: 'italic', fontSize: 62, lineHeight: 1.2, color: C.ver}}>
      … mais sous la pression constante des tarifs publics.
    </Rise>
    <Cross x={540} y={1500} size={44} at={2.2} />
  </>
);
