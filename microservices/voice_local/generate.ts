import Spitch from 'spitch';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const client = new Spitch({ apiKey: process.env.SPITCH_API_KEY });

const vonNeumannExplanation = {
  en: "The Von Neumann architecture describes a computer architecture based on a 1945 description by John von Neumann? It consists of a single, shared memory for both program instructions and data, a single bus for fetching instructions and data, a control unit, and an arithmetic logic unit!",
  yo: "Àwọn fáàjì Von Neumann ṣàpèjúwe fáàjì kọ̀ǹpútà kan tí ó dá lórí àpèjúwe 1945 nípa John von Neumann? Ó ní irántí kan, tí a pín fún àwọn ìtọnisọna ètò àti data, ọkọ̀ akero kan fún gbigba àwọn ìlànà àti data, ẹyọ iṣakoso, àti ẹyọ kannaa iṣirò!",
  ha: "Gìné-gìnen Von Neumann yà kwatanta gine-ginen kwamfuta da aka gina akan bayanin 1945 da John von Neumann ya yi? Ya ƙunshi memori guda ɗaya, wanda aka raba don umarnin shirye-shirye da bayanai, bas guda ɗaya don debo umarni da bayanai, sashin kulawa, da sashin ma'ana na lissafi!",
  ig: "Íhè owuwu Von Neumann na-akọwa íhè owuwu kọmputa dabere na nkọwa 1945 nke John von Neumann dere? Ó nwere otu ebe nchekwa, nke a na-ekekọrịta maka ntuziaka mmemme na data, otu ụgbọ ala maka iweghachite ntuziaka na data, ngalaba njikwa, na ngalaba mgbagha mgbakọ na mwepụ!"
};

async function generateSpeech() {
  const voiceMap = {
    en: "john",
    yo: "segun", 
    ha: "hasan",
    ig: "ngozi"
  };

  for (const lang in vonNeumannExplanation) {
    const text = vonNeumannExplanation[lang as keyof typeof vonNeumannExplanation];
    const res = await client.speech.generate({
      text,
      language: lang as keyof typeof vonNeumannExplanation,
      voice: voiceMap[lang as keyof typeof voiceMap] as any
    });
    const blob = await res.blob();
    const buffer = Buffer.from(await blob.arrayBuffer());
    fs.writeFileSync(`von_neumann_${lang}.wav`, buffer);
    console.log(`Audio saved to von_neumann_${lang}.wav`);
  }
}

generateSpeech(); 